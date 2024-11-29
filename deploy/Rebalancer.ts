import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { deployWithVerify, BOOK_MANAGER, SAFE_WALLET } from '../utils'
import { getChain, isDevelopmentNetwork } from '@nomicfoundation/hardhat-viem/internal/chains'
import { Address } from 'viem'
import { arbitrum, base } from 'viem/chains'

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre
  // const chain = await getChain(network.provider)
  // const deployer = (await getNamedAccounts())['deployer'] as Address

  if (await deployments.getOrNull('Rebalancer')) {
    return
  }

 let owner: Address = "0x8381c90a455c162E0aCA3cBE80e7cE5D590C7703"
  let bookManagerAddress: Address = "0xA3bEab3AeE3d92d629C4B3Fb40ca1b3fFeFE482B"

  await deployWithVerify(hre, 'Rebalancer', [bookManagerAddress, owner])
}

deployFunction.tags = ['Rebalancer']
export default deployFunction
