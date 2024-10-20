import { getConfig, getWalletClient, getKey, initKorSDK } from './main';
import { Base } from './module/base';
import { createConfig } from '@wagmi/core';
import { setOrigin } from './utils';
import { KorChain } from './types';

// Mock dependencies
jest.mock('@wagmi/core', () => ({
  createConfig: jest.fn(),
}));

jest.mock('@wagmi/core/chains', () => ({
  baseSepolia: { id: 'baseSepolia', network: 'sepolia' },
  base: { id: 'base', network: 'base' },
}));

jest.mock('./utils', () => ({
  getApiUrl: jest.fn().mockReturnValue('http://mock-api-url'),
  setOrigin: jest.fn(),
}));

describe('Kor SDK Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return undefined initially', () => {
      expect(getConfig()).toBeUndefined();
    });
  });

  describe('getWalletClient', () => {
    it('should return undefined initially', () => {
      expect(getWalletClient()).toBeUndefined();
    });
  });

  describe('getKey', () => {
    it('should return an empty string initially', () => {
      expect(getKey()).toBe('');
    });
  });

  describe('initKorSDK', () => {
    it('should set the apiKey correctly', async () => {
      const mockChain = 1 as KorChain;
      const mockRpc = 'http://mock-rpc-url';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      });

      await initKorSDK('mock-api-key', { chain: mockChain, rpc: mockRpc });

      expect(getKey()).toBe('mock-api-key');
    });

    it('should call fetch with the correct API URL for key validation', async () => {
      const mockChain = 1 as KorChain;
      const mockRpc = 'http://mock-rpc-url';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      });

      await initKorSDK('mock-api-key', { chain: mockChain, rpc: mockRpc });

      expect(global.fetch).toHaveBeenCalledWith(
        'http://mock-api-url/user/api-key/validate/mock-api-key'
      );
    });

    it('should throw an error when API key validation fails', async () => {
      const mockChain = 1 as KorChain;
      const mockRpc = 'http://mock-rpc-url';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
      });

      await expect(initKorSDK('mock-api-key', { chain: mockChain, rpc: mockRpc })).rejects.toThrow(
        'invalid key'
      );
    });

    it('should return an instance of Base when API key validation succeeds', async () => {
      const mockChain = 1 as KorChain;
      const mockRpc = 'http://mock-rpc-url';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      });

      const result = await initKorSDK('mock-api-key', { chain: mockChain, rpc: mockRpc });

      expect(result).toBeInstanceOf(Base);
    });
  });

  describe('createKorConfig', () => {
    it('should create config with the correct chain and RPC transport', async () => {
      const mockChain = 1 as KorChain;
      const mockRpc = 'http://mock-rpc-url';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      });
      await initKorSDK('mock-api-key', { chain: mockChain, rpc: mockRpc });

      expect(createConfig).toHaveBeenCalledWith({
        chains: [mockChain],
        transports: {
          1: expect.anything(), // Expecting the http transport function
        },
        syncConnectedChain: true,
      });
    });

    it('should set the origin if it is provided', async () => {
      const mockChain = 1 as KorChain;
      const mockRpc = 'http://mock-rpc-url';
      const mockOrigin = 'http://mock-origin';

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      });

      await initKorSDK('mock-api-key', { chain: mockChain, rpc: mockRpc, origin: mockOrigin });

      expect(setOrigin).toHaveBeenCalledWith(mockOrigin);
    });
  });
});
