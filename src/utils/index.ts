import { getAccount, reconnect } from '@wagmi/core';
import { getConfig, getKey } from '../main';

export const API_BASE_URL = 'https://d2sgq03nhe022i.cloudfront.net/kor-sdk-api';

let origin = API_BASE_URL;

export const setOrigin = (newOrigin: string) => {
  origin = newOrigin;
};

export const getApiUrl = () => origin;

export const checkValidChainAndWallet = async () => {
  await reconnect(getConfig()!);

  const { chain, address } = getAccount(getConfig()!);
  if (!chain) {
    throw new Error('invalid chain');
  }
  if (!address) {
    throw new Error('invalid wallet address');
  }
  return { address };
};

export const getContractAddresses = (): {
  NFT_CONTRACT_ADDRESS: `0x${string}`;
  IP_CONTRACT_ADDRESS: `0x${string}`;
  LICENSE_CONTRACT_ADDRESS: `0x${string}`;
  ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: `0x${string}`;
  REV_TOKEN_CONTRACT_ADDRESS: `0x${string}`;
} => {
  if (origin === 'https://dq9c2zl6kih9v.cloudfront.net/kor-sdk-api') {
    return {
      NFT_CONTRACT_ADDRESS: '0x0838f2bf2D33036D8ddE2180B00C7Ea5e6a82004',
      IP_CONTRACT_ADDRESS: '0xDe5F0eE373F957caC615B2813fb42A48c70a8048',
      LICENSE_CONTRACT_ADDRESS: '0xaFb2F3bE4EF3E9f5A3Ab31299be34097E189af93',
      ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0xd3B4E3DB20cbFfE897eE40d74d2B1b2C25f912B3',
      REV_TOKEN_CONTRACT_ADDRESS: '0xcAC23Cd7B9580E6fb96e875F7222a43F482467eD',
    };
  }

  return {
    NFT_CONTRACT_ADDRESS: '0xA27916307Ce2A196CC0c7719e540CaE5e3E4A784',
    IP_CONTRACT_ADDRESS: '0xF05631F10cC0904b85A55A49208f6aCCaB5e7614',
    LICENSE_CONTRACT_ADDRESS: '0x1E51268AD742c5602Aec285c786093fe73E8eeaa',
    ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0xd3B4E3DB20cbFfE897eE40d74d2B1b2C25f912B3',
    REV_TOKEN_CONTRACT_ADDRESS: '0xcAC23Cd7B9580E6fb96e875F7222a43F482467eD',
  };
};

export const generateSignature = async (address: `0x${string}`) => {
  const response = await fetch(
    `${getApiUrl()}/blockchain/transaction-signature/${address}/${getConfig()?.chains[0]?.id}`,
    {
      headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
    }
  );
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error((await response.json())?.message ?? 'Failed to generate signature');
  }
};
