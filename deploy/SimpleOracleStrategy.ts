import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { deployWithVerify, BOOK_MANAGER, SAFE_WALLET } from '../utils'
import { getChain, isDevelopmentNetwork } from '@nomicfoundation/hardhat-viem/internal/chains'
import { Address } from 'viem'
import { arbitrum, arbitrumSepolia, base } from 'viem/chains'

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre
  const chain = await getChain(network.provider)
  const deployer = (await getNamedAccounts())['deployer'] as Address

  if (await deployments.getOrNull('SimpleOracleStrategy')) {
    return
  }

  const rebalancer = await deployments.get('Rebalancer')

  let owner: Address = "0x8381c90a455c162E0aCA3cBE80e7cE5D590C7703"
  let bookManagerAddress: Address = "0xA3bEab3AeE3d92d629C4B3Fb40ca1b3fFeFE482B"
  let rebalancerAddress: Address = "0xE3DA7E931581999F2954Ed622e3b9Fa956942019"
  let oracleAddress: Address = "0xC84ce331F8951f141217275B48C79AfD4186a155"

  // if (chain.id == arbitrumSepolia.id) {
  //   oracleAddress = (await deployments.get('DatastreamOracle')).address as Address
  //   owner = deployer
  // } else if (chain.id === base.id) {
  //   oracleAddress = (await deployments.get('ChainlinkOracle')).address as Address
  //   owner = SAFE_WALLET[chain.id] // Safe
  // } else {
  //   throw new Error('Unknown chain')
  // }

  const args = [oracleAddress, rebalancerAddress, bookManagerAddress, owner]
  await deployWithVerify(hre, 'SimpleOracleStrategy', args)
}

deployFunction.tags = ['SimpleOracleStrategy']
deployFunction.dependencies = ['Oracle', 'Rebalancer']
export default deployFunction
