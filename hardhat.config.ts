import path from 'path'
import "dotenv/config";

require("dotenv").config({ path: require("find-config")(".env") });
const fs = require("fs");
import * as dotenv from 'dotenv'
import readlineSync from 'readline-sync'
import type { NetworkUserConfig } from "hardhat/types";

import 'hardhat-deploy'
import '@nomicfoundation/hardhat-viem'
import '@nomicfoundation/hardhat-foundry'
import '@nomicfoundation/hardhat-verify'
import 'hardhat-gas-reporter'
import 'hardhat-contract-sizer'
import 'hardhat-abi-exporter'
import '@nomiclabs/hardhat-waffle'
import '@openzeppelin/hardhat-upgrades'


import { HardhatConfig } from 'hardhat/types'
import * as networkInfos from 'viem/chains'

dotenv.config()
const mantleSepoliaTestnet: NetworkUserConfig = {
  url: "https://rpc.sepolia.mantle.xyz",
  chainId: 5003,
  accounts: [process.env.KEY_TESTNET!],
};
const arbitrumSepolia: NetworkUserConfig = {
  url: "https://arbitrum-sepolia.blockpi.network/v1/rpc/public",
  chainId: 421614,
  accounts: [process.env.KEY_TESTNET!],
};
const sepolia: NetworkUserConfig = {
  url: "https://eth-sepolia.g.alchemy.com/v2/wUAOjtKSS75xfUEZah0k9ODHKHDC5PO0",
  chainId: 11155111,
  accounts: [process.env.KEY_TESTNET!],
};
const chainIdMap: { [key: string]: string } = {}
for (const [networkName, networkInfo] of Object.entries(networkInfos)) {
  // @ts-ignore
  chainIdMap[networkInfo.id] = networkName
}

const SKIP_LOAD = process.env.SKIP_LOAD === 'true'

// Prevent to load scripts before compilation

let privateKey: string
let ok: string

const loadPrivateKeyFromKeyfile = () => {
  let network
  for (const [i, arg] of Object.entries(process.argv)) {
    if (arg === '--network') {
      network = parseInt(process.argv[parseInt(i) + 1])
      if (network.toString() in chainIdMap && ok !== 'Y') {
        ok = readlineSync.question(`You are trying to use ${chainIdMap[network.toString()]} network [Y/n] : `)
        if (ok !== 'Y') {
          throw new Error('Network not allowed')
        }
      }
    }
  }

  const prodNetworks = new Set<number>([
    networkInfos.mainnet.id,
    networkInfos.arbitrum.id,
    networkInfos.base.id,
    // networkInfos.zkSync.id,
  ])
  if (network && prodNetworks.has(network)) {
    if (privateKey) {
      return privateKey
    }
    const keythereum = require('keythereum')

    const KEYSTORE = './deployer-key.json'
    const PASSWORD = readlineSync.question('Password: ', {
      hideEchoBack: true,
    })
    if (PASSWORD !== '') {
      const keyObject = JSON.parse(fs.readFileSync(KEYSTORE).toString())
      privateKey = '0x' + keythereum.recover(PASSWORD, keyObject).toString('hex')
    } else {
      privateKey = '0x0000000000000000000000000000000000000000000000000000000000000001'
    }
    return privateKey
  }
  return '0x0000000000000000000000000000000000000000000000000000000000000001'
}

const config: HardhatConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          evmVersion: 'cancun',
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: '0.8.23',
        settings: {
          evmVersion: 'london',
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
    overrides: {},
  },
  defaultNetwork: 'hardhat',
  networks: {
    ...(process.env.KEY_TESTNET && { mantleSepoliaTestnet }),
    ...(process.env.KEY_TESTNET && { sepolia }),
    ...(process.env.KEY_TESTNET && { arbitrumSepolia }),
  
    hardhat: {
      chainId: networkInfos.hardhat.id,
      // gas: 20000000,
      // gasPrice: 250000000000,
      gasMultiplier: 1.5,
      // @ts-ignore
      // forking: {
      //   enabled: true,
      //   url: 'ARCHIVE_NODE_URL',
      // },
      mining: {
        auto: true,
        interval: 0,
        mempool: {
          order: 'fifo',
        },
      },
      accounts: {
        mnemonic: 'loop curious foster tank depart vintage regret net frozen version expire vacant there zebra world',
        initialIndex: 0,
        count: 10,
        path: "m/44'/60'/0'/0",
        accountsBalance: '10000000000000000000000000000',
        passphrase: '',
      },
      blockGasLimit: 200000000,
      // @ts-ignore
      minGasPrice: undefined,
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: true,
      initialDate: new Date().toISOString(),
      loggingEnabled: false,
      // @ts-ignore
      chains: undefined,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  abiExporter: [
    // @ts-ignore
    {
      path: './abi',
      runOnCompile: false,
      clear: true,
      flat: true,
      only: [],
      except: [],
      spacing: 2,
      pretty: false,
      filter: () => true,
    },
  ],
  mocha: {
    timeout: 40000000,
    require: ['hardhat/register'],
  },
  // @ts-ignore
  contractSizer: {
    runOnCompile: true,
  },
  etherscan: {
    apiKey: {
      mantleSepoliaTestnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      arbitrumSepolia: process.env.ARBISCAN_API_KEY,
    },
    customChains: [
      {
        network: 'mantleSepoliaTestnet',
        chainId: 5003,
        urls: {
          apiURL: 'https://explorer.testnet.mantle.xyz/api',
          browserURL: 'https://explorer.testnet.mantle.xyz',
        },
      }
    ],
    enabled: true,
  },
  sourcify: {
    // Enable Sourcify verification by default
    enabled: true,
    apiUrl: 'https://sourcify.dev/server',
    browserUrl: 'https://repo.sourcify.dev',
  },
}

export default config