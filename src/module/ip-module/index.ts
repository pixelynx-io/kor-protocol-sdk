import { readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig } from '../../main';
import { IBuyIPNFT, IRegisterDerivative, IRegisterNFT } from '../../types';
import { ipModuleABI } from '../../abis/ip-module';
import { decodeEventLog, parseUnits } from 'viem';
import { generateSignature, getContractAddresses } from '../../utils';
import { licenseModuleAbi } from '../../abis/license-module';

export class OnChainIPModule {
  async registerNFT(input: IRegisterNFT, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: ipModuleABI,
      address: getContractAddresses().IP_CONTRACT_ADDRESS,
      functionName: 'registerNFTEncoded',
      args: [
        input.tokenContract,
        input.tokenId,
        input.licensors,
        input.isMintAllowed ?? false,
        input.isUnlimitedSupply ?? false,
        input.ipSupply ?? 0,
        parseUnits(`${input.mintPrice ?? 0}`, 18),
        encodedData,
        signature,
      ],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: ipModuleABI,
      data: input.isMintAllowed
        ? transactionResponse.logs[6].data
        : transactionResponse.logs[2].data,
      topics: input.isMintAllowed
        ? transactionResponse.logs[6].topics
        : transactionResponse.logs[2].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }

  async registerDerivates(input: IRegisterDerivative, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);
    let licenseFee: bigint;
    try {
      const ipCollectionDetails = (await readContract(getConfig()!, {
        abi: ipModuleABI,
        functionName: 'getIPAsset',
        address: getContractAddresses().IP_CONTRACT_ADDRESS,
        args: [input.parentIP],
      })) as { licenseTermId: number };

      const mintPriceResponse = (await readContract(getConfig()!, {
        abi: licenseModuleAbi,
        functionName: 'getLicense',
        address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
        args: [ipCollectionDetails.licenseTermId],
      })) as { licenseFee: bigint };
      licenseFee = mintPriceResponse.licenseFee;
    } catch (error) {
      throw new Error((error as Error)?.message || 'Failed to get license fee');
    }
    try {
      const data = await writeContract(getConfig()!, {
        abi: ipModuleABI,
        address: getContractAddresses().IP_CONTRACT_ADDRESS,
        functionName: 'registerDerivativeEncoded',
        args: [
          input.tokenContract,
          input.tokenId,
          input.parentIP,
          input.isMintAllowed ?? false,
          input.isUnlimitedSupply ?? false,
          input.ipSupply ?? 0,
          parseUnits(`${input.mintPrice ?? 0}`, 18),
          encodedData,
          signature,
        ],
        value: licenseFee,
      });

      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      const topics = decodeEventLog({
        abi: ipModuleABI,
        data: input.isMintAllowed
          ? transactionResponse.logs[9].data
          : transactionResponse.logs[5].data,
        topics: input.isMintAllowed
          ? transactionResponse.logs[9].topics
          : transactionResponse.logs[5].topics,
      });

      return { transactionResponse, result: { ...topics.args } };
    } catch (error) {
      throw new Error((error as Error)?.message || 'Failed to register derivative');
    }
  }

  async getLicenseFee(parentIP: string) {
    const ipCollectionDetails = (await readContract(getConfig()!, {
      abi: ipModuleABI,
      functionName: 'getIPAsset',
      address: getContractAddresses().IP_CONTRACT_ADDRESS,
      args: [parentIP],
    })) as { licenseTermId: number };

    const mintPriceResponse = (await readContract(getConfig()!, {
      abi: licenseModuleAbi,
      functionName: 'getLicense',
      address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
      args: [ipCollectionDetails.licenseTermId],
    })) as { licenseFee: bigint };
    return mintPriceResponse?.licenseFee;
  }

  async buyIPNFT(input: IBuyIPNFT) {
    const mintPriceResponse = (await readContract(getConfig()!, {
      abi: ipModuleABI,
      functionName: 'getIpMintPrice',
      address: getContractAddresses().IP_CONTRACT_ADDRESS,
      args: [input.ip],
    })) as bigint;
    const data = await writeContract(getConfig()!, {
      abi: ipModuleABI,
      address: getContractAddresses().IP_CONTRACT_ADDRESS,
      functionName: 'buyIpNft',
      args: [input.ip, input.recipient],
      value: mintPriceResponse,
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
