import yaml from 'js-yaml';
import fs from 'fs';
import dotenv from 'dotenv';

import { deployEnvironment } from './deploy_utils';

// TODO: rm
dotenv.config();

async function main() {
  const configPath = process.env.DEPLOY_CONFIG_PATH;

  if (!configPath) {
    throw new Error('"DEPLOY_CONFIG_PATH" env is undeclared');
  }

  const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
  
  const version = process.env.CONTRACT_VERSION;

  if (!version) {
    throw new Error('"CONTRACT_VERSION" env is undeclared');
  }

  await deployEnvironment(config, version, process.env.GNOSIS_SAFE_ADDRESS, process.env.GNOSIS_SAFE_SERVICE_URL);

  fs.writeFileSync(configPath, yaml.dump(config));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
