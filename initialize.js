import * as ethers from 'ethers'
import { EthWallet } from 'wakkanay-ethereum/dist/wallet'
import { Address, Bytes } from 'wakkanay/dist/types'
import { IndexedDbKeyValueStore } from 'wakkanay/dist/db'
import LightClient from 'wakkanay-plasma-light-client'
import {
  DepositContract,
  ERC20Contract,
  CommitmentContract
} from 'wakkanay-ethereum/dist/contract'
import {
  StateManager,
  SyncManager,
  CheckpointManager
} from 'wakkanay-plasma-light-client/dist/managers'

async function instantiate() {
  const kvs = new IndexedDbKeyValueStore(Bytes.fromString('plasma_aggregator'))
  const eventDb = await kvs.bucket(Bytes.fromString('event'))

  const wallet = new EthWallet(
    new ethers.Wallet(
      process.env.TEST_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(process.env.MAIN_CHAIN_HOST)
    )
  )

  function depositContractFactory(address) {
    return new DepositContract(address, eventDb, wallet.getEthersWallet())
  }

  function tokenContractFactory(address) {
    return new ERC20Contract(address, wallet.getEthersWallet())
  }

  const stateDb = await kvs.bucket(Bytes.fromString('state'))
  const stateManager = new StateManager(stateDb)

  const syncDb = await kvs.bucket(Bytes.fromString('sync'))
  const syncManager = new SyncManager(syncDb)

  const checkpointDb = await kvs.bucket(Bytes.fromString('checkpoint')) 
  const checkpointManager = new CheckpointManager(checkpointDb)

  const commitmentContract = new CommitmentContract(
    Address.from(process.env.COMMITMENT_CONTRACT_ADDRESS),
    eventDb,
    wallet.getEthersWallet()
  )

  return new LightClient(
    wallet,
    kvs,
    depositContractFactory,
    tokenContractFactory,
    commitmentContract,
    stateManager,
    syncManager,
    checkpointManager
  )
}

export default async function initialize() {
  const lightClient = await instantiate()
  await lightClient.start()

  return lightClient
}
