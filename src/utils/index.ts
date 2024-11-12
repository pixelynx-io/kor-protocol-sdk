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
    NFT_CONTRACT_ADDRESS: '0xBbC36c20bE91B93dDF43cA148F0F647f9495e18b',
    IP_CONTRACT_ADDRESS: '0x3b794FE858b2c6916Aea641FAf4FbbdcCF345A66',
    LICENSE_CONTRACT_ADDRESS: '0x74FEcCB4807fF95594777d24b0003cf592Bf6AC1',
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
