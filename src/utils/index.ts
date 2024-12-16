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
    NFT_CONTRACT_ADDRESS: '0x38366fa4C442Fa977c8CB4F5fDB594DF2faaF0b8',
    IP_CONTRACT_ADDRESS: '0xF1C1B3AB04EF8F89d95335bCc37F4C6eb408f13A',
    LICENSE_CONTRACT_ADDRESS: '0xd77c6e58ceb19ECdE1e6E2fe38A79d56B0079522',
    ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0xBBD1057B0c64947407E98A52742Dc2b2348b65a3',
    REV_TOKEN_CONTRACT_ADDRESS: '0x2c253Cf9BD00daAED126F5baDC08C6f609C1eFfc',
    CONFLICT_MANAGEMENT_ADDRESS: '0x742493e571eF772cf67dA7EAdA54ba0772f33668',
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

export const getApiHeaders = () => {
  return { 'api-key': getKey(), 'captcha-token': getCaptchaToken() };
};
