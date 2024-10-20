import { getAccount, reconnect } from '@wagmi/core';
import { getConfig } from '../main';

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
};

export const getContractAddresses = (): {
  NFT_CONTRACT_ADDRESS: `0x${string}`;
  IP_CONTRACT_ADDRESS: `0x${string}`;
} => {
  if (origin === 'https://dq9c2zl6kih9v.cloudfront.net/kor-sdk-api') {
    return {
      NFT_CONTRACT_ADDRESS: '0x54c66Cf1781a32cb3A03A2E44ffFa95c5b5A7cb7',
      IP_CONTRACT_ADDRESS: '0xDd6f002Cd290b9B5DFFD7095B595723149Cb6C28',
    };
  }

  return {
    NFT_CONTRACT_ADDRESS: '0x981F3e9Eb4aa87067ACf58B906B9b1f86325bbcB',
    IP_CONTRACT_ADDRESS: '0x40C52a8c02A8ea393CB5f9DedFBD75f797Fcd7B5',
  };
};
