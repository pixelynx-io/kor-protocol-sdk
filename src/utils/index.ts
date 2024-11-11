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
} => {
  if (origin === 'https://dq9c2zl6kih9v.cloudfront.net/kor-sdk-api') {
    return {
      NFT_CONTRACT_ADDRESS: '0x54c66Cf1781a32cb3A03A2E44ffFa95c5b5A7cb7',
      IP_CONTRACT_ADDRESS: '0xDd6f002Cd290b9B5DFFD7095B595723149Cb6C28',
      LICENSE_CONTRACT_ADDRESS: '0xe2cD2D674b214313CbDD574541bF569b5D409e37',
    };
  }

  return {
    NFT_CONTRACT_ADDRESS: '0x031aF781EaaD762C06c97c439F74011A57F0Ca78',
    IP_CONTRACT_ADDRESS: '0x36402815746D3bB0688F1ABf990b70C7918eBd38',
    LICENSE_CONTRACT_ADDRESS: '0x3B34064c8d564cbFffA4B398dBD6C2565d927aF3',
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
