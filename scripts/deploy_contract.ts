import dotenv from "dotenv";
import yn from "yn";
import { ethers } from "hardhat";
import { deployContract } from "./deploy_utils";

dotenv.config();

async function main() {
  const proxyAddress = process.env.UPGRADE_PROXY_ADDRESS!;
  const contractFactory = process.env.UPGRADE_CONTRACT_NEW!;
  const gnosisSafeAddress = process.env.GNOSIS_SAFE_ADDRESS!;
  const gnosisSafeServiceURL = process.env.GNOSIS_SAFE_SERVICE_URL!;
  const useUUPS = yn(process.env.UPGRADE_USE_UUPS!, { default: false });
  const useLibrary = yn(process.env.UPGRADE_USE_LIBRARY!);
  const libraryName = process.env.UPGRADE_LIBRARY_NAME!;
  const libraryAddress = process.env.UPGRADE_LIBRARY_ADDRESS!;
  const version = process.env.CONTRACT_VERSION!;

  // ---
  console.log("- Validation -");
  // ---

  if (!proxyAddress) {
    console.warn("Please set the UPGRADE_PROXY_ADDRESS");
    return;
  }

  if (!contractFactory) {
    console.warn("Please set the UPGRADE_CONTRACT_NEW name");
    return;
  }

  if (useLibrary && !libraryName) {
    console.warn("Please set the UPGRADE_LIBRARY_NAME");
    return;
  }

  if (useLibrary && !libraryAddress) {
    console.warn("Please set the UPGRADE_LIBRARY_ADDRESS");
    return;
  }

  const libraries = useLibrary ? [{ factory: libraryName, address: libraryAddress }] : [];

  const [ deployer ] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log("Proxy Address:", proxyAddress);
  console.log("Contract Factory:", contractFactory);
  console.log("GnosisSafe Address:", gnosisSafeAddress);
  console.log("GnosisSafe URL:", gnosisSafeServiceURL);
  console.log("Use UUPS:", useUUPS);
  console.log("Libraries:", libraries);

  ////////////////////// Admin must be check this settings before run the script ////////////////////////
  // await keypress();

  return deployContract({
    contractFactory,
    proxyAddress,
    useUUPS,
    gnosisSafeAddress,
    gnosisSafeServiceURL,
    libraries,
    version,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
export { deployContract };

