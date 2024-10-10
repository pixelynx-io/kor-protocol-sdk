import { getWalletClient, reconnect, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig, getKey } from '../../main';
import { NFT_CONTRACT_ADDRESS, nftModuleContract } from '../../abis/nft-module';
import {
  ICreateCollection,
  ICreateIPCollection,
  IMintFromCollection,
  IMintFromProtocolCollection,
  IMintIPFromIPCollection,
} from '../../types';
import { decodeEventLog } from 'viem';
import { ipModuleABI } from '../../abis/ip-module';

export class NFTModule {
  async createCollection(data: ICreateCollection) {
    await reconnect(getConfig()!);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/nft-module/create-collection/${getConfig()?.chains[0]?.id}`,
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
        address: NFT_CONTRACT_ADDRESS,
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
    await reconnect(getConfig()!);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/nft-module/create-ip-collection/${getConfig()?.chains[0]?.id}`,
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
        address: NFT_CONTRACT_ADDRESS,
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
    await reconnect(getConfig()!);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/nft-module/mint-from-collection/${getConfig()?.chains[0]?.id}`,
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
        address: NFT_CONTRACT_ADDRESS,
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
    await reconnect(getConfig()!);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/nft-module/mint-from-protocol-collection/${getConfig()?.chains[0]?.id}`,
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
        address: NFT_CONTRACT_ADDRESS,
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
    await reconnect(getConfig()!);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/nft-module/mint-ip-from-ip-collection/${getConfig()?.chains[0]?.id}`,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
      }
    );
    if (response.ok) {
      const { encodedData, signature } = await response.json();
      const client = await getWalletClient(getConfig()!);
      const data = await writeContract(getConfig()!, {
        abi: nftModuleContract,
        address: NFT_CONTRACT_ADDRESS,
        functionName: 'mintIPfromIPCollectionEncoded',
        args: [encodedData, signature],
        account: client?.account,
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
