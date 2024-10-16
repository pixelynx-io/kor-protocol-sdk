/* eslint-disable @typescript-eslint/no-explicit-any */
import { Base } from './base';
import { NFTModule } from './nft-module';
import { IPModule } from './ip-module';
import {
  ICreateCollection,
  ICreateIPCollection,
  IMintFromCollection,
  IMintFromProtocolCollection,
  IMintIPFromIPCollection,
  IRegisterDerivative,
  IRegisterNFT,
} from '../types';

// Mock NFTModule and IPModule classes
jest.mock('@wagmi/core', () => ({
  createConfig: jest.fn(),
}));

jest.mock('@wagmi/core/chains', () => ({
  baseSepolia: { id: 'baseSepolia', network: 'sepolia' },
  base: { id: 'base', network: 'base' },
}));

jest.mock('../utils', () => ({
  getApiUrl: jest.fn().mockReturnValue('http://mock-api-url'),
  setOrigin: jest.fn(),
  checkValidChainAndWallet: jest.fn(),
}));
jest.mock('./nft-module');
jest.mock('./ip-module');

describe('Base Class Unit Tests', () => {
  let base: Base;
  let nftModuleMock: jest.Mocked<NFTModule>;
  let ipModuleMock: jest.Mocked<IPModule>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a new instance of Base
    base = new Base();

    // Get references to the mocked modules
    nftModuleMock = NFTModule.prototype as jest.Mocked<NFTModule>;
    ipModuleMock = IPModule.prototype as jest.Mocked<IPModule>;
  });

  describe('createCollection', () => {
    it('should call createCollection on NFTModule with the correct data', async () => {
      const data: ICreateCollection = {
        name: 'test',
        symbol: 'TEST',
      };
      nftModuleMock.createCollection.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.createCollection(data);

      expect(nftModuleMock.createCollection).toHaveBeenCalledWith(data);
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('createIPCollection', () => {
    it('should call createIPCollection on NFTModule with the correct data', async () => {
      const data: ICreateIPCollection = {
        name: 'test',
        symbol: 'TEST',
        licenseTermID: 1,
        licensors: ['0x', '0x', '0x'],
        maxSupply: 1000,
        mintPrice: 0.01,
      };
      nftModuleMock.createIPCollection.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.createIPCollection(data);

      expect(nftModuleMock.createIPCollection).toHaveBeenCalledWith(data);
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('mintFromCollection', () => {
    it('should call mintFromCollection on NFTModule with the correct data', async () => {
      const data: IMintFromCollection = {
        /* mock data here */
        collectionAddress: '0x',
        metadataURI: 'ipfs://test',
        recipientAddress: '0x',
      };
      nftModuleMock.mintFromCollection.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.mintFromCollection(data);

      expect(nftModuleMock.mintFromCollection).toHaveBeenCalledWith(data);
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('mintFromProtocolCollection', () => {
    it('should call mintFromProtocolCollection on NFTModule with the correct data', async () => {
      const data: IMintFromProtocolCollection = {
        metadataURI: 'ipfs://test',
        recipientAddress: '0x',
      };
      nftModuleMock.mintFromProtocolCollection.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.mintFromProtocolCollection(data);

      expect(nftModuleMock.mintFromProtocolCollection).toHaveBeenCalledWith(data);
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('mintIPFromIPCollection', () => {
    it('should call mintIPFromIPCollection on NFTModule with the correct data', async () => {
      const data: IMintIPFromIPCollection = {
        ipID: '0x',
        recipientAddress: '0x',
        uri: 'ipfs://test',
      };
      nftModuleMock.mintIPFromIPCollection.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.mintIPFromIPCollection(data);

      expect(nftModuleMock.mintIPFromIPCollection).toHaveBeenCalledWith(data);
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('registerNFT', () => {
    it('should call registerNFT on IPModule with the correct data', async () => {
      const data: IRegisterNFT = {
        licensors: ['0x', '0x', '0x'],
        tokenContract: '0x',
        tokenId: 1,
      };
      ipModuleMock.registerNFT.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.registerNFT(data);

      expect(ipModuleMock.registerNFT).toHaveBeenCalledWith(data);
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('registerDerivates', () => {
    it('should call registerDerivates on IPModule with the correct data', async () => {
      const data: IRegisterDerivative = {
        parentIP: '0x',
        tokenContract: '0x',
        tokenId: 1,
      };
      ipModuleMock.registerDerivates.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.registerDerivates(data);

      expect(ipModuleMock.registerDerivates).toHaveBeenCalledWith(data);
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });
});
