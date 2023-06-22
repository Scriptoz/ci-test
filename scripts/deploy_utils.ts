import { ethers, upgrades } from "hardhat";
import { sleep, verify } from "../utils/helpers";
import {
  multisig,
  secondConfirmTransaction,
  executeBatch,
} from "../utils/multisig";
import { upgradeProxyAbi } from "../data/contracts_abi/upgradeProxy.json";
import { proxyAdminAbi } from "../data/contracts_abi/proxyAdmin.json";
import "@openzeppelin/hardhat-upgrades";
import { Lock__factory } from "../typechain-types";

interface ContractDeployParams {
  useMultiSig?: boolean;

  gnosisSafeAddress?: string;

  gnosisSafeServiceURL?: string;

  proxyAddress: string;

  contractFactory: string;

  useUUPS?: boolean;

  version: string;

  libraries?: Array<{ factory: string, address: string }>;
}
  
export async function deployEnvironment(config: any, version: string, gnosisSafeAddress?: string, gnosisSafeServiceURL?: string) {
  console.log(`Deployment to ${config.name} has been started...`);

  for (const library of config.libraries) {
    if (!library.address) {
      library.address = await deployLibrary(library.factory);
    }
  }

  for (const contract of config.contracts) {
    const libraries = [];

    for (const libraryFactory of contract.libraries) {
      const library = config.libraries.find((item: any) => item.factory === libraryFactory);

      if (!library) {
        throw new Error(`Library ${libraryFactory} was not defined on environment ${config.name}`);
      }

      libraries.push(library);
    }

    await deployContract({
      contractFactory: contract.factory,
      proxyAddress: contract.address,
      libraries,
      useMultiSig: !!gnosisSafeAddress && !!gnosisSafeServiceURL,
      gnosisSafeAddress,
      gnosisSafeServiceURL,
      useUUPS: true,
      version,
    });
  }

  console.log(`Deployment to ${config.name} has been finished`);
}

export async function deployLibrary(libraryFactoryName: string): Promise<string> {
  const [ deployer ] = await ethers.getSigners();

  const libraryFactory = await ethers.getContractFactory(
    libraryFactoryName,
    {
      signer: deployer,
    }
  );

  const library = await libraryFactory.deploy();

  console.log(`Library ${libraryFactoryName} has been deployed to ${library.address}`);

  return library.address;
}

export async function deployContract(data: ContractDeployParams) {
  const { useMultiSig, gnosisSafeAddress = '', gnosisSafeServiceURL = '', proxyAddress, contractFactory, useUUPS, version, libraries = [] } = data;

  const [ deployer ] = await ethers.getSigners();

  // Contract factory param
  let factoryParam = {};
  let librariesParam: Record<string, string> = {};
  
  for (const library of libraries) {
    librariesParam[library.factory] = library.address;
  }

  if (libraries.length > 0) {
    factoryParam = {
      libraries: librariesParam,
    };
  }

  // Upgrade Param
  let upgradeParam = {
    unsafeAllow: [],
    unsafeAllowLinkedLibraries: !!libraries.length,
  };

  const ContractFactoryNew = await ethers.getContractFactory(
    contractFactory,
    factoryParam
  );

  if (useMultiSig) {
    const provider = new ethers.providers.JsonRpcProvider(
      // @ts-ignore
      network.config.url,
      // @ts-ignore
      { name: network.config.addressesSet, chainId: network.config.chainId! }
    );

    const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY!, provider);

    // ---
    console.log("- Upgrade -");
    // ---

    const contractImpl: any = await upgrades.prepareUpgrade(
      proxyAddress,
      ContractFactoryNew,
      upgradeParam
    );

    console.log("Proxy:", proxyAddress);
    console.log("New Implementation:", contractImpl);

    if (useUUPS) {
      // Factory should be changed for the contract
      const ContractFactory = getContractFactory(contractFactory).connect(
        proxyAddress,
        deployer
      );
      await multisig(
        gnosisSafeServiceURL,
        ContractFactory,
        "upgradeTo",
        [contractImpl],
        JSON.stringify(upgradeProxyAbi),
        signer
      );
    } else {
      const proxyAdmin = (await upgrades.admin.getInstance()).address;
      const ProxyAdmin = ethers.ContractFactory.getContract(
        proxyAdmin,
        proxyAdminAbi,
        deployer
      );

      await multisig(
        gnosisSafeServiceURL,
        ProxyAdmin,
        "upgrade",
        [proxyAddress, contractImpl],
        JSON.stringify(proxyAdminAbi),
        signer
      );
    }

    // ---
    console.log("- Verify contract -");
    // ---
    console.log("Sleeping for 1 seconds before verification...");
    await sleep(1000);
    console.log(">>>>>>>>>>>> Verification >>>>>>>>>>>>");
    await verify(contractImpl);
  } else {
    let proxy: any;

    if (!proxyAddress) {
      console.log("- Deploy Proxy -");

      proxy = await upgrades.deployProxy(
        ContractFactoryNew,
        [],
        upgradeParam,
      );
      await proxy.deployed();
  
      const proxyImpl = await upgrades.erc1967.getImplementationAddress(
        proxy.address
      );
      console.log("Proxy:", proxy.address);
      console.log("Implementation:", proxyImpl);
    } else {
      console.log("- Upgrade Implementation -");

      proxy = await upgrades.upgradeProxy(
        proxyAddress,
        ContractFactoryNew,
        upgradeParam
      );
      await proxy.deployed();
    }

    console.log("- Verify contract -");
    console.log("Sleeping for 1 seconds before verification...");
    await sleep(1000);
    console.log(">>>>>>>>>>>> Verification >>>>>>>>>>>>");
    
    for (const library of libraries) {
      await verify(library.address);
    }
    
    await verify(proxy.address);

    console.log("- Set version -", version);
    const tx = await proxy
      .connect(deployer)
      .upgradeVersion(version, "");
    await tx.wait(1);
  }
}

function getContractFactory(factoryName: string) {
  switch (factoryName) {
    case 'Lock':
      return Lock__factory;

    default:
      throw new Error(`Unregistered contract factory name '${factoryName}'`);
  }
}
