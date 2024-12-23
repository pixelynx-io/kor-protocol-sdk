import { getAccount, reconnect } from '@wagmi/core';
import { getCaptchaToken, getConfig, getKey } from '../main';

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
  CONFLICT_MANAGEMENT_ADDRESS: `0x${string}`;
} => {
  if (origin === 'https://dq9c2zl6kih9v.cloudfront.net/kor-sdk-api') {
    return {
      NFT_CONTRACT_ADDRESS: '0x9208f5006dC44A3B3Acb1fA8515C3d0400298a10',
      IP_CONTRACT_ADDRESS: '0x7A07153aa85c610A8CDF5d2d95eC6Dc137Ea14fA',
      LICENSE_CONTRACT_ADDRESS: '0x2DF0321d4D5089A9Ab3aC3f49c59aA2Ff533156c',
      ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0x00c99a478CdE05D1808B29962B22E535Bc6C1FE2',
      REV_TOKEN_CONTRACT_ADDRESS: '0xe757DF1E2058c4739322E2a1c6Ee6F52bb77e3e1',
      CONFLICT_MANAGEMENT_ADDRESS: '0xC82660Ea14eAF6Eb104aDcF7aFEC5bE77019E292',
    };
  }

  return {
    NFT_CONTRACT_ADDRESS: '0x83F302a4313a257F5E6233BbF22C336da351D31E',
    IP_CONTRACT_ADDRESS: '0x49529F7EF623F952518ea9B491dF0A2736243b13',
    LICENSE_CONTRACT_ADDRESS: '0xdc3e458aa4480B0cEABcFDBefa8B1334E651869f',
    ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0xc2458439690a8D6f1081D49F8ba36b61aD8B303E',
    REV_TOKEN_CONTRACT_ADDRESS: '0x6E13A34429f57c4A8CcF83340532DA25a72E3352',
    CONFLICT_MANAGEMENT_ADDRESS: '0x732D06d2EAEaeA6D978d83de0D78EF93AD1d9927',
  };
};

export const generateSignature = async (address: `0x${string}`) => {
  const response = await fetch(
    `${getApiUrl()}/blockchain/transaction-signature/${address}/${getConfig()?.chains[0]?.id}`,
    {
      headers: { 'Content-Type': 'application/json', ...getApiHeaders() },
    }
  );
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error((await response.json())?.message ?? 'Failed to generate signature');
  }
};

export const generateSignatureForConflicts = async (address: `0x${string}`) => {
  const response = await fetch(
    `${getApiUrl()}/blockchain/conflict-transaction-signature/${address}/${getConfig()?.chains[0]?.id}`,
    {
      headers: { 'Content-Type': 'application/json', ...getApiHeaders() },
    }
  );
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error((await response.json())?.message ?? 'Failed to generate signature');
  }
};

export const validateInputs = (inputList: string[]) => {
  const specialCharRegex = /[^a-zA-Z0-9 ]/; // Matches special characters

  // Use Array.some() to check if any input is invalid
  const invalidInput = inputList.find((input) => !input.trim() || specialCharRegex.test(input));

  if (invalidInput) {
    throw new Error(
      `Invalid input detected: "${invalidInput}" contains special characters or is empty.`
    );
  }
};

export const isValidURL = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    throw new Error((error as Error)?.message ?? 'Invalid URL');
  }
};

export const getApiHeaders = () => {
  return { 'api-key': getKey(), 'captcha-token': getCaptchaToken() };
};
