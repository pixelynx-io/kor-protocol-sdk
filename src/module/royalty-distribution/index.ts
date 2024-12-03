import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { IActivateRoyalty, ICollectRevenue, IPayRoyalty } from '../../types';
import { generateSignature, getContractAddresses, validateInputs } from '../../utils';
import { getConfig } from '../../main';
import { royaltyDistributionModuleAbi } from '../../abis/royalty-distribution-module';
import { decodeEventLog, parseUnits } from 'viem';
import { revTokenAbi } from '../../abis/rev-token';

export class RoyaltyDistributionModule {
  async activateRoyalty(input: IActivateRoyalty, address: `0x${string}`) {
    try {
      validateInputs([input.royaltyTokenName, input.royaltyTokenSymbol]);
      const { encodedData, signature } = await generateSignature(address);
      const data = await writeContract(getConfig()!, {
        abi: royaltyDistributionModuleAbi,
        address: getContractAddresses().ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS,
        functionName: 'activateRoyalty',
        args: [
          input.ip,
          input.royaltyTokenName,
          input.royaltyTokenSymbol,
          parseUnits(`${input.mintRTSupply}`, 18),
          encodedData,
          signature,
        ],
      });
      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      const topics = decodeEventLog({
        abi: royaltyDistributionModuleAbi,
        data: transactionResponse.logs[2].data,
        topics: transactionResponse.logs[2].topics,
      });
      return { transactionResponse, result: { ...topics.args } };
    } catch (error) {
      throw new Error((error as Error)?.message ?? 'Some error occurred');
    }
  }

  async payRoyalty(input: IPayRoyalty, address: `0x${string}`) {
    const approvalData = await writeContract(getConfig()!, {
      abi: revTokenAbi,
      address: getContractAddresses().REV_TOKEN_CONTRACT_ADDRESS,
      functionName: 'approve',
      args: [
        getContractAddresses().ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS,
        parseUnits(`${input.amount}`, 18),
      ],
    });
    const approvalTransactionResponse = await waitForTransactionReceipt(getConfig()!, {
      hash: approvalData,
    });
    if (approvalTransactionResponse.status !== 'success') {
      throw new Error('Failed to approve royalty amount');
    }
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: royaltyDistributionModuleAbi,
      address: getContractAddresses().ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS,
      functionName: 'payRoyalty',
      args: [input.ip, parseUnits(`${input.amount}`, 18), encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: royaltyDistributionModuleAbi,
      data: transactionResponse.logs[2].data,
      topics: transactionResponse.logs[2].topics,
    });
    let result = { [(topics.eventName ?? '') as string]: { ...topics.args } };
    if (transactionResponse?.logs?.length >= 6) {
      const childTopics = decodeEventLog({
        abi: royaltyDistributionModuleAbi,
        data: transactionResponse.logs[5].data,
        topics: transactionResponse.logs[5].topics,
      });
      result = { ...result, [(childTopics.eventName ?? '') as string]: { ...childTopics.args } };
    }
    return { transactionResponse, result };
  }

  async collectRevenue(input: ICollectRevenue, address: `0x${string}`) {
    try {
      const { encodedData, signature } = await generateSignature(address);
      const data = await writeContract(getConfig()!, {
        abi: royaltyDistributionModuleAbi,
        address: getContractAddresses().ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS,
        functionName: 'collectRevenue',
        args: [input.ip, input.snapshotId, encodedData, signature],
      });
      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      console.log('transactionResponse', data);
      const topics = decodeEventLog({
        abi: royaltyDistributionModuleAbi,
        data: transactionResponse.logs[2].data,
        topics: transactionResponse.logs[2].topics,
      });
      return { transactionResponse, result: { ...topics.args } };
    } catch (error) {
      throw new Error((error as Error)?.message ?? 'Some error occurred');
    }
  }
}
