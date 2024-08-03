import { ethers, network } from 'hardhat'
import { encryptDataField } from '@swisstronik/utils'
import { HttpNetworkConfig } from 'hardhat/types'
import deployedAddress from '../utils/deployed-address'
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'

const sendShieldedTransaction = async (
  signer: HardhatEthersSigner,
  destination: string,
  data: string,
  value: number
) => {
  const rpclink = (network.config as HttpNetworkConfig).url

  const [encryptedData] = await encryptDataField(rpclink, data)

  return await signer.sendTransaction({
    from: signer.address,
    to: destination,
    data: encryptedData,
    value,
  })
}

async function main() {
  const contractAddress = deployedAddress
  const [signer] = await ethers.getSigners()

  const contractFactory = await ethers.getContractFactory('PERC20Sample')
  const contract = contractFactory.attach(contractAddress)

  const functionName = 'transfer'
  const receiptAddress = '0x16af037878a6cAce2Ea29d39A3757aC2F6F7aac1'
  const amount = ethers.parseUnits('10', 18)
  const setMessageTx = await sendShieldedTransaction(
    signer,
    contractAddress,
    contract.interface.encodeFunctionData(functionName, [receiptAddress, amount]),
    0
  )
  await setMessageTx.wait()

  console.log('Transaction Receipt: ', setMessageTx)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
