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
      NFT_CONTRACT_ADDRESS: '0xa574878DC0ee38D02F6b34C9391dD8d8eAA16955',
      IP_CONTRACT_ADDRESS: '0xC30d5ED55964EF1a0cbB41C58783882f34bcc554',
      LICENSE_CONTRACT_ADDRESS: '0xc3d75512ddB5e4b820453829f500282Dc3Cf9De2',
      ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0x018c2CFE5d2CF3643d4300aB6102939D4d438935',
      REV_TOKEN_CONTRACT_ADDRESS: '0xF79F29dc2887Cc78F7a4734BB8967CB608227B8c',
      CONFLICT_MANAGEMENT_ADDRESS: '0x69843DEEa59FfA6d10038b34249762257F56622C',
    };
  }

  return {
    NFT_CONTRACT_ADDRESS: '0xa574878DC0ee38D02F6b34C9391dD8d8eAA16955',
    IP_CONTRACT_ADDRESS: '0xC30d5ED55964EF1a0cbB41C58783882f34bcc554',
    LICENSE_CONTRACT_ADDRESS: '0xc3d75512ddB5e4b820453829f500282Dc3Cf9De2',
    ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0x018c2CFE5d2CF3643d4300aB6102939D4d438935',
    REV_TOKEN_CONTRACT_ADDRESS: '0xF79F29dc2887Cc78F7a4734BB8967CB608227B8c',
    CONFLICT_MANAGEMENT_ADDRESS: '0x69843DEEa59FfA6d10038b34249762257F56622C',
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
