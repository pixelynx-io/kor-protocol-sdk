import {
  checkValidChainAndWallet,
  getContractAddresses,
  generateSignature,
  validateInputs,
  isValidURL,
  getApiHeaders,
  setOrigin,
} from '.';
import { getAccount } from '@wagmi/core';
import { getCaptchaToken, getConfig, getKey, supportedChains } from '../main';

// Mocking external dependencies
jest.mock('@wagmi/core', () => ({
  getAccount: jest.fn(),
  reconnect: jest.fn(),
}));

jest.mock('../main', () => ({
  getConfig: jest.fn(),
  getCaptchaToken: jest.fn(),
  getKey: jest.fn(),
}));

global.fetch = jest.fn();
const mockGetConfig = getConfig as jest.Mock;
const mockGetAccount = getAccount as jest.Mock;
const mockGetKey = getKey as jest.Mock;
const mockGetCaptchaToken = getCaptchaToken as jest.Mock;
describe('checkValidChainAndWallet', () => {
  it('should throw an error if the chain is invalid', async () => {
    mockGetAccount.mockReturnValue({ chain: null, address: '0xValidAddress' });
    mockGetConfig.mockReturnValue({ chains: [supportedChains] });

    await expect(checkValidChainAndWallet()).rejects.toThrow('invalid chain');
  });

  it('should throw an error if the address is invalid', async () => {
    mockGetAccount.mockReturnValue({ chain: 'validChain', address: null });
    mockGetConfig.mockReturnValue({ chains: [supportedChains] });

    await expect(checkValidChainAndWallet()).rejects.toThrow('invalid wallet address');
  });

  it('should return address if the chain and address are valid', async () => {
    mockGetAccount.mockReturnValue({ chain: 'validChain', address: '0xValidAddress' });
    mockGetConfig.mockReturnValue({ chains: [supportedChains] });

    const result = await checkValidChainAndWallet();
    expect(result).toEqual({ address: '0xValidAddress' });
  });
});

describe('getContractAddresses', () => {
  it('should return correct contract addresses for the first origin', () => {
    setOrigin('https://dq9c2zl6kih9v.cloudfront.net/kor-sdk-api');

    const result = getContractAddresses();
    expect(result).toEqual({
      NFT_CONTRACT_ADDRESS: '0x0838f2bf2D33036D8ddE2180B00C7Ea5e6a82004',
      IP_CONTRACT_ADDRESS: '0xDe5F0eE373F957caC615B2813fb42A48c70a8048',
      LICENSE_CONTRACT_ADDRESS: '0xaFb2F3bE4EF3E9f5A3Ab31299be34097E189af93',
      ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0xd3B4E3DB20cbFfE897eE40d74d2B1b2C25f912B3',
      REV_TOKEN_CONTRACT_ADDRESS: '0xcAC23Cd7B9580E6fb96e875F7222a43F482467eD',
      CONFLICT_MANAGEMENT_ADDRESS: '0xb66E2d56D007b9c2A6293cCe4E64b78Fc23b3754',
    });
  });

  it('should return correct contract addresses for the second origin', () => {
    setOrigin('https://another-origin.com');

    const result = getContractAddresses();
    expect(result).toEqual({
      NFT_CONTRACT_ADDRESS: '0x9208f5006dC44A3B3Acb1fA8515C3d0400298a10',
      IP_CONTRACT_ADDRESS: '0x7A07153aa85c610A8CDF5d2d95eC6Dc137Ea14fA',
      LICENSE_CONTRACT_ADDRESS: '0x2DF0321d4D5089A9Ab3aC3f49c59aA2Ff533156c',
      ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0x00c99a478CdE05D1808B29962B22E535Bc6C1FE2',
      REV_TOKEN_CONTRACT_ADDRESS: '0xe757DF1E2058c4739322E2a1c6Ee6F52bb77e3e1',
      CONFLICT_MANAGEMENT_ADDRESS: '0xC82660Ea14eAF6Eb104aDcF7aFEC5bE77019E292',
    });
  });
});

describe('generateSignature', () => {
  it('should return the signature if the response is ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ signature: 'someSignature' }),
    });

    const result = await generateSignature('0xSomeAddress');
    expect(result).toEqual({ signature: 'someSignature' });
  });

  it('should throw an error if the response is not ok', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Some error' }),
    });

    await expect(generateSignature('0xSomeAddress')).rejects.toThrow('Some error');
  });
});

describe('validateInputs', () => {
  it('should throw an error if input contains special characters', () => {
    expect(() => validateInputs(['validInput', 'invalid@Input'])).toThrow(
      'Invalid input detected: "invalid@Input" contains special characters or is empty.'
    );
  });

  it('should throw an error if input is empty', () => {
    expect(() => validateInputs(['validInput', ' '])).toThrow(
      'Invalid input detected: " " contains special characters or is empty.'
    );
  });

  it('should not throw an error if all inputs are valid', () => {
    expect(() => validateInputs(['validInput1', 'validInput2'])).not.toThrow();
  });
});

describe('isValidURL', () => {
  it('should return true for a valid URL', () => {
    expect(isValidURL('https://valid.url')).toBe(true);
  });

  it('should throw an error for an invalid URL', () => {
    expect(() => isValidURL('invalid-url')).toThrow('Invalid URL');
  });
});

describe('getApiHeaders', () => {
  it('should return correct headers', () => {
    mockGetKey.mockReturnValue('some-api-key');
    mockGetCaptchaToken.mockReturnValue('some-captcha-token');

    const result = getApiHeaders();
    expect(result).toEqual({
      'api-key': 'some-api-key',
      'captcha-token': 'some-captcha-token',
    });
  });
});
