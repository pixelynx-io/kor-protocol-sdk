import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig, getKey } from '../../main';
import { nftModuleContract } from '../../abis/nft-module';
import {
  ICreateCollection,
  ICreateIPCollection,
  IMintFromCollection,
  IMintFromProtocolCollection,
  IMintIPFromIPCollection,
} from '../../types';
import { decodeEventLog } from 'viem';
import { ipModuleABI } from '../../abis/ip-module';
import { getApiUrl, getContractAddresses } from '../../utils';

export class NFTModule {
  async createCollection(data: ICreateCollection) {
    const response = await fetch(
      `${getApiUrl()}/nft-module/create-collection/${getConfig()?.chains[0]?.id}`,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
      }
    );
    console.log('NFT_CONTRACT_ADDRESS', getContractAddresses().NFT_CONTRACT_ADDRESS);
    if (response.ok) {
      const { encodedData, signature } = await response.json();
      const data = await writeContract(getConfig()!, {
        abi: nftModuleContract,
        address: getContractAddresses().NFT_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'createCollectionEncoded',
        args: [encodedData, signature],
      });
      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      const topics = decodeEventLog({
        abi: nftModuleContract,
        data: transactionResponse.logs[3].data,
        topics: transactionResponse.logs[3].topics,
      });
      return { transactionResponse, result: { ...topics.args } };
    }

    throw new Error((await response.json())?.message);
  }

  async createIPCollection(data: ICreateIPCollection) {
    const response = await fetch(
      `${getApiUrl()}/nft-module/create-ip-collection/${getConfig()?.chains[0]?.id}`,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
      }
    );
    if (response.ok) {
      const { encodedData, signature } = await response.json();
      const data = await writeContract(getConfig()!, {
        abi: nftModuleContract,
        address: getContractAddresses().NFT_CONTRACT_ADDRESS,
        functionName: 'createIPCollectionEncoded',
        args: [encodedData, signature],
      });
      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      const topics = decodeEventLog({
        abi: nftModuleContract,
        data: transactionResponse.logs[7].data,
        topics: transactionResponse.logs[7].topics,
      });
      return { transactionResponse, result: { ...topics.args } };
    }

    throw new Error((await response.json())?.message);
  }

  async mintFromCollection(data: IMintFromCollection) {
    const response = await fetch(
      `${getApiUrl()}/nft-module/mint-from-collection/${getConfig()?.chains[0]?.id}`,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
      }
    );
    if (response.ok) {
      const { encodedData, signature } = await response.json();
      const data = await writeContract(getConfig()!, {
        abi: nftModuleContract,
        address: getContractAddresses().NFT_CONTRACT_ADDRESS,
        functionName: 'mintFromCollectionEncoded',
        args: [encodedData, signature],
      });
      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      const topics = decodeEventLog({
        abi: nftModuleContract,
        data: transactionResponse.logs[2].data,
        topics: transactionResponse.logs[2].topics,
      });
      return { transactionResponse, result: { ...topics.args } };
    }

    throw new Error((await response.json())?.message);
  }

  async mintFromProtocolCollection(data: IMintFromProtocolCollection) {
    const response = await fetch(
      `${getApiUrl()}/nft-module/mint-from-protocol-collection/${getConfig()?.chains[0]?.id}`,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
      }
    );
    if (response.ok) {
      const { encodedData, signature } = await response.json();
      const data = await writeContract(getConfig()!, {
        abi: nftModuleContract,
        address: getContractAddresses().NFT_CONTRACT_ADDRESS,
        functionName: 'mintFromProtocolCollectionEncoded',
        args: [encodedData, signature],
      });
      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      const topics = decodeEventLog({
        abi: nftModuleContract,
        data: transactionResponse.logs[2].data,
        topics: transactionResponse.logs[2].topics,
      });
      return { transactionResponse, result: { ...topics.args } };
    }

    throw new Error((await response.json())?.message);
  }

  async mintIPFromIPCollection(data: IMintIPFromIPCollection) {
    const response = await fetch(
      `${getApiUrl()}/nft-module/mint-ip-from-ip-collection/${getConfig()?.chains[0]?.id}`,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
      }
    );
    if (response.ok) {
      const { encodedData, signature } = await response.json();
      // const client = await getWalletClient(getConfig()!);
      const data = await writeContract(getConfig()!, {
        abi: nftModuleContract,
        address: getContractAddresses().NFT_CONTRACT_ADDRESS,
        functionName: 'mintIPfromIPCollectionEncoded',
        args: [encodedData, signature],
        // account: client?.account,
      });
      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      const topics = decodeEventLog({
        abi: ipModuleABI,
        data: transactionResponse.logs[3].data,
        topics: transactionResponse.logs[3].topics,
      });
      return { transactionResponse, result: { ...topics.args } };
    }

    throw new Error((await response.json())?.message);
  }
}
