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
      NFT_CONTRACT_ADDRESS: '0xF845B27dCb9f22fE7c29576b6839974330F8999d',
      IP_CONTRACT_ADDRESS: '0xECe2A168723a42479d2669c17A7506b51e28eAcb',
      LICENSE_CONTRACT_ADDRESS: '0x2a7022b995AF3c618EAB0611476b67A0bB1612e5',
      ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0xF43951ae9A98AA1134e99477CEB8B77B771d6f47',
      REV_TOKEN_CONTRACT_ADDRESS: '0x98c2EbF3479F8c5767ea19Be6D8592b67fCcE107',
      CONFLICT_MANAGEMENT_ADDRESS: '0xCFd8115190B755F77C27147e5613f46c79b8eA95',
    };
  }

  return {
    NFT_CONTRACT_ADDRESS: '0xF845B27dCb9f22fE7c29576b6839974330F8999d',
    IP_CONTRACT_ADDRESS: '0xECe2A168723a42479d2669c17A7506b51e28eAcb',
    LICENSE_CONTRACT_ADDRESS: '0x2a7022b995AF3c618EAB0611476b67A0bB1612e5',
    ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0xF43951ae9A98AA1134e99477CEB8B77B771d6f47',
    REV_TOKEN_CONTRACT_ADDRESS: '0x98c2EbF3479F8c5767ea19Be6D8592b67fCcE107',
    CONFLICT_MANAGEMENT_ADDRESS: '0xCFd8115190B755F77C27147e5613f46c79b8eA95',
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
