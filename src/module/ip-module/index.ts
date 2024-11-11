import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig } from '../../main';
import { IRegisterDerivative, IRegisterNFT } from '../../types';
import { ipModuleABI } from '../../abis/ip-module';
import { decodeEventLog } from 'viem';
import { generateSignature, getContractAddresses } from '../../utils';

export class OnChainIPModule {
  async registerNFT(input: IRegisterNFT, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: ipModuleABI,
      address: getContractAddresses().IP_CONTRACT_ADDRESS,
      functionName: 'registerNFTEncoded',
      args: [input.tokenContract, input.tokenId, input.licensors, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: ipModuleABI,
      data: transactionResponse.logs[2].data,
      topics: transactionResponse.logs[2].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }

  async registerDerivates(input: IRegisterDerivative, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: ipModuleABI,
      address: getContractAddresses().IP_CONTRACT_ADDRESS,
      functionName: 'registerDerivativeEncoded',
      args: [input.tokenContract, input.tokenId, input.parentIP, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: ipModuleABI,
      data: transactionResponse.logs[2].data,
      topics: transactionResponse.logs[2].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }
}
