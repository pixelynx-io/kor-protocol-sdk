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
      NFT_CONTRACT_ADDRESS: '0x0838f2bf2D33036D8ddE2180B00C7Ea5e6a82004',
      IP_CONTRACT_ADDRESS: '0xDe5F0eE373F957caC615B2813fb42A48c70a8048',
      LICENSE_CONTRACT_ADDRESS: '0xaFb2F3bE4EF3E9f5A3Ab31299be34097E189af93',
      ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0xd3B4E3DB20cbFfE897eE40d74d2B1b2C25f912B3',
      REV_TOKEN_CONTRACT_ADDRESS: '0xcAC23Cd7B9580E6fb96e875F7222a43F482467eD',
      CONFLICT_MANAGEMENT_ADDRESS: '0xb66E2d56D007b9c2A6293cCe4E64b78Fc23b3754',
    };
  }

  return {
    NFT_CONTRACT_ADDRESS: '0xfC35549568e37314b57f9d6Bbf838510E23d9114',
    IP_CONTRACT_ADDRESS: '0x6DFDaA0CFD60a3b5185a824c25CC76DC009DEA91',
    LICENSE_CONTRACT_ADDRESS: '0xd165cA4707Dab89cE841499FA7396d4B1Cc21B87',
    ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0x63d6C7bd7A726Db429daB769faa64d7906CD7D41',
    REV_TOKEN_CONTRACT_ADDRESS: '0x7E4617a921A08E86Fdd49aBA5EdC3456E38248Ca',
    CONFLICT_MANAGEMENT_ADDRESS: '0x7f0D0022169dC444F1E7168376F6eC3A635f89C8',
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
