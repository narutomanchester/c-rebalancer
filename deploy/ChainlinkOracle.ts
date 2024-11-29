import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import {
  deployWithVerify,
  CHAINLINK_SEQUENCER_ORACLE,
  ORACLE_TIMEOUT,
  SEQUENCER_GRACE_PERIOD,
  SAFE_WALLET,
} from '../utils'
import { getChain } from '@nomicfoundation/hardhat-viem/internal/chains'
import { Address } from 'viem'
import { arbitrumSepolia, base } from 'viem/chains'

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, network } = hre
  const chain = await getChain(network.provider)

  if (await deployments.getOrNull('ChainlinkOracle')) {
    return
  }

  let owner: Address = "0x8381c90a455c162E0aCA3cBE80e7cE5D590C7703"
  let bookManagerAddress: Address = "0xA3bEab3AeE3d92d629C4B3Fb40ca1b3fFeFE482B"
  // if (chain.id == base.id) {
  //   owner = SAFE_WALLET[chain.id] // Safe
  // } else if (chain.id == arbitrumSepolia.id) {
  //   return
  // } else {
  //   throw new Error('Unknown chain')
  // }

  const args = ["0x8B0f27aDf87E037B53eF1AADB96bE629Be37CeA8", 86400, 3600, owner]
  await deployWithVerify(hre, 'ChainlinkOracle', args)
}

deployFunction.tags = ['Oracle']
export default deployFunction
