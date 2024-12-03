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
import { generateSignature, getContractAddresses, validateInputs } from '../../utils';

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
      data: transactionResponse.logs[7].data,
      topics: transactionResponse.logs[7].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }

  async mintFromCollection(input: IMintFromCollection, address: `0x${string}`) {
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
      args: [input.ipID, input.recipientAddress, input.uri, encodedData, signature],
      value: mintPrice,
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: ipModuleABI,
      data: transactionResponse.logs[3].data,
      topics: transactionResponse.logs[3].topics,
    });
    return { transactionResponse, result: { ...topics.args } };
  }
}
