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
    NFT_CONTRACT_ADDRESS: '0x56173f7be898B62E6EaF70A52d5198dbaa6Fa7b7',
    IP_CONTRACT_ADDRESS: '0x8263667389FACaC7ee57858fC4Ec846889027676',
    LICENSE_CONTRACT_ADDRESS: '0x9D3B570D58DCE8cdB06194B87794C2f925699c48',
    ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0x6F49fC8e5256E1C1E9CA6F7FC4662F37A7301eDe',
    REV_TOKEN_CONTRACT_ADDRESS: '0x0EC00077b0FD8F5e3e6A5F5D413B1885f5E183A9',
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
