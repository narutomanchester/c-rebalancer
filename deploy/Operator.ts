import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { deployWithVerify, SAFE_WALLET, getDeployedAddress } from '../utils'
import { getChain, isDevelopmentNetwork } from '@nomicfoundation/hardhat-viem/internal/chains'
import { Address } from 'viem'
import { arbitrum, base } from 'viem/chains'

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre
  const chain = await getChain(network.provider)
  const deployer = (await getNamedAccounts())['deployer'] as Address

  if (await deployments.getOrNull('Operator')) {
    return
  }

  let owner: Address = '0x8381c90a455c162E0aCA3cBE80e7cE5D590C7703'
  

  await deployWithVerify(hre, 'Operator', [await getDeployedAddress('Rebalancer')], {
    proxy: {
      proxyContract: 'UUPS',
      execute: {
        methodName: 'initialize',
        args: [owner],
      },
    },
  })
}

deployFunction.tags = ['Operator']
deployFunction.dependencies = ['Rebalancer']
export default deployFunction
