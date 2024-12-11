import { readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { ICancelConflict, IRaiseConflict, IResolveConflict } from '../../types';
import { generateSignatureForConflicts, getContractAddresses } from '../../utils';
import { getConfig } from '../../main';
import { conflictModuleAbi } from '../../abis/conflict-module';
import { decodeEventLog } from 'viem';
import { revTokenAbi } from '../../abis/rev-token';

export class ConflictModule {
  async raiseConflict(input: IRaiseConflict, address: `0x${string}`) {
    const tierDetails = (await readContract(getConfig()!, {
      abi: conflictModuleAbi,
      functionName: 'getTierDetails',
      address: getContractAddresses().CONFLICT_MANAGEMENT_ADDRESS,
      args: [input.tier],
    })) as Array<number>;

    const approvalData = await writeContract(getConfig()!, {
      abi: revTokenAbi,
      address: getContractAddresses().REV_TOKEN_CONTRACT_ADDRESS,
      functionName: 'approve',
      args: [getContractAddresses().CONFLICT_MANAGEMENT_ADDRESS, tierDetails[0]],
    });

    const approvalTransactionResponse = await waitForTransactionReceipt(getConfig()!, {
      hash: approvalData,
    });
    if (approvalTransactionResponse.status !== 'success') {
      throw new Error('Failed to approve royalty amount');
    }
    const { encodedData, signature } = await generateSignatureForConflicts(address);
    const data = await writeContract(getConfig()!, {
      abi: conflictModuleAbi,
      address: getContractAddresses().CONFLICT_MANAGEMENT_ADDRESS,
      functionName: 'raiseConflictEncoded',
      args: [input.ip, input.evidenceLink, input.tier, encodedData, signature],
    });

    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: conflictModuleAbi,
      data: transactionResponse.logs[1].data,
      topics: transactionResponse.logs[1].topics,
    });

    return { transactionResponse, result: { ...topics.args } };
  }

  async resolveConflict(input: IResolveConflict, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignatureForConflicts(address);
    const data = await writeContract(getConfig()!, {
      abi: conflictModuleAbi,
      address: getContractAddresses().CONFLICT_MANAGEMENT_ADDRESS,
      functionName: 'resolveConflictEncoded',
      args: [input.conflictId, input.isValidConflict, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: conflictModuleAbi,
      data: transactionResponse.logs[2].data,
      topics: transactionResponse.logs[2].topics,
    });

    return { transactionResponse, result: { ...topics.args } };
  }

  async cancelConflict(input: ICancelConflict, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignatureForConflicts(address);
    const data = await writeContract(getConfig()!, {
      abi: conflictModuleAbi,
      address: getContractAddresses().CONFLICT_MANAGEMENT_ADDRESS,
      functionName: 'cancelConflictEncoded',
      args: [input.conflictId, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: conflictModuleAbi,
      data: transactionResponse.logs[1].data,
      topics: transactionResponse.logs[1].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }
}
