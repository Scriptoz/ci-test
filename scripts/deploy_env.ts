import yaml from 'js-yaml';
import fs from 'fs';
import dotenv from 'dotenv';

import { deployEnvironment } from './deploy_utils';

// TODO: rm
dotenv.config();

async function main() {
  console.log('----------------------');
  console.log('DEPLOY_CONFIG_PATH', process.env.DEPLOY_CONFIG_PATH);
  console.log('MAINNET_PROVIDER_URL', process.env.MAINNET_PROVIDER_URL);
  console.log('DEPLOYER_PRIVATE_KEY', process.env.DEPLOYER_PRIVATE_KEY);

  const configPath = process.env.DEPLOY_CONFIG_PATH;

  if (!configPath) {
    throw new Error('"DEPLOY_CONFIG_PATH" env is undeclared');
  }
  
  const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
  
  await deployEnvironment(config);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
