import { readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig } from '../../main';
import { getIPDetailsContract, nftModuleContract } from '../../abis/nft-module';
import {
  ICreateCollection,
  ICreateIPCollection,
  IMintFromCollection,
  IMintFromProtocolCollection,
  IMintIPFromIPCollection,
} from '../../types';
import { decodeEventLog, parseUnits } from 'viem';
import { ipModuleABI } from '../../abis/ip-module';
import { generateSignature, getContractAddresses, isValidURL, validateInputs } from '../../utils';

export class NFTModule {
  async createCollection(input: ICreateCollection, address: `0x${string}`) {
    validateInputs([input.name, input.symbol]);
    const { encodedData, signature } = await generateSignature(address);
    const data = await writeContract(getConfig()!, {
      abi: nftModuleContract,
      address: getContractAddresses().NFT_CONTRACT_ADDRESS,
      functionName: 'createCollectionEncoded',
      args: [input.name, input.symbol, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: nftModuleContract,
      data: transactionResponse.logs[3].data,
      topics: transactionResponse.logs[3].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }

  async createIPCollection(input: ICreateIPCollection, address: `0x${string}`) {
    validateInputs([input.name, input.symbol]);
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: nftModuleContract,
      address: getContractAddresses().NFT_CONTRACT_ADDRESS,
      functionName: 'createIPCollectionEncoded',
      args: [
        input.name,
        input.symbol,
        parseUnits(`${input.mintPrice}`, 18),
        input.maxSupply,
        input.licensors,
        encodedData,
        signature,
      ],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: nftModuleContract,
      data: transactionResponse.logs[6].data,
      topics: transactionResponse.logs[6].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }

  async mintFromCollection(input: IMintFromCollection, address: `0x${string}`) {
    isValidURL(input?.metadataURI);
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: nftModuleContract,
      address: getContractAddresses().NFT_CONTRACT_ADDRESS,
      functionName: 'mintFromCollectionEncoded',
      args: [
        input.collectionAddress,
        input.recipientAddress,
        input.metadataURI,
        encodedData,
        signature,
      ],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: nftModuleContract,
      data: transactionResponse.logs[2].data,
      topics: transactionResponse.logs[2].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }

  async mintFromProtocolCollection(input: IMintFromProtocolCollection, address: `0x${string}`) {
    isValidURL(input?.metadataURI);
    const { encodedData, signature } = await generateSignature(address);
    const data = await writeContract(getConfig()!, {
      abi: nftModuleContract,
      address: getContractAddresses().NFT_CONTRACT_ADDRESS,
      functionName: 'mintFromProtocolCollectionEncoded',
      args: [input.recipientAddress, input.metadataURI, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: nftModuleContract,
      data: transactionResponse.logs[2].data,
      topics: transactionResponse.logs[2].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }

  async mintIPFromIPCollection(input: IMintIPFromIPCollection, address: `0x${string}`) {
    isValidURL(input?.uri);
    const { encodedData, signature } = await generateSignature(address);
    let mintPrice: bigint = BigInt(0);
    try {
      const ipCollectionDetails = (await readContract(getConfig()!, {
        abi: ipModuleABI,
        functionName: 'getIPCollection',
        address: getContractAddresses().IP_CONTRACT_ADDRESS,
        args: [input.ipID],
      })) as { ipCollectionAddress: `0x${string}` };
      const mintPriceResponse = (await readContract(getConfig()!, {
        abi: getIPDetailsContract,
        functionName: '_mintPrice',
        address: ipCollectionDetails?.ipCollectionAddress,
      })) as bigint;
      mintPrice = mintPriceResponse;
    } catch (error) {
      console.warn('Failed to get mint price', error);
    }
    const data = await writeContract(getConfig()!, {
      abi: nftModuleContract,
      address: getContractAddresses().NFT_CONTRACT_ADDRESS,
      functionName: 'mintIPfromIPCollectionEncoded',
      args: [
        input.ipID,
        input.recipientAddress,
        input.uri,
        input.isMintAllowed ?? false,
        input.isUnlimitedSupply ?? false,
        input.ipSupply ?? 0,
        parseUnits(`${input.mintPrice ?? 0}`, 18),
        encodedData,
        signature,
      ],
      value: mintPrice,
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: ipModuleABI,
      data: input.isMintAllowed
        ? transactionResponse.logs[8].data
        : transactionResponse.logs[4].data,
      topics: input.isMintAllowed
        ? transactionResponse.logs[8].topics
        : transactionResponse.logs[4].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }
}
