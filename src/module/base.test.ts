/* eslint-disable @typescript-eslint/no-explicit-any */
import { Base } from './base';
import { NFTModule } from './nft-module';
import { OnChainIPModule } from './ip-module';
import {
  IActivateRoyalty,
  IAttachLicense,
  IBuyIPNFT,
  ICreateCollection,
  ICreateCustomLicense,
  ICreateIPCollection,
  ICreateSmartLicense,
  IMintFromCollection,
  IMintFromProtocolCollection,
  IMintIPFromIPCollection,
  IRegisterDerivative,
  IRegisterNFT,
} from '../types';
import { OnChainLicenseModule } from './license';
import { RoyaltyDistributionModule } from './royalty-distribution';

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
  checkValidChainAndWallet: jest.fn().mockResolvedValue({ address: '0x' }),
}));
jest.mock('./nft-module');
jest.mock('./ip-module');
jest.mock('./license');
jest.mock('./royalty-distribution');

describe('Base Class Unit Tests', () => {
  let base: Base;
  let nftModuleMock: jest.Mocked<NFTModule>;
  let ipModuleMock: jest.Mocked<OnChainIPModule>;
  let licenseModuleMock: jest.Mocked<OnChainLicenseModule>;
  let royaltyDistributionModuleMock: jest.Mocked<RoyaltyDistributionModule>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create a new instance of Base
    base = new Base();

    // Get references to the mocked modules
    nftModuleMock = NFTModule.prototype as jest.Mocked<NFTModule>;
    ipModuleMock = OnChainIPModule.prototype as jest.Mocked<OnChainIPModule>;
    licenseModuleMock = OnChainLicenseModule.prototype as jest.Mocked<OnChainLicenseModule>;
    royaltyDistributionModuleMock =
      RoyaltyDistributionModule.prototype as jest.Mocked<RoyaltyDistributionModule>;
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

      expect(nftModuleMock.createCollection).toHaveBeenCalledWith(data, '0x');
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('createIPCollection', () => {
    it('should call createIPCollection on NFTModule with the correct data', async () => {
      const data: ICreateIPCollection = {
        name: 'test',
        symbol: 'TEST',
        licensors: ['0x', '0x', '0x'],
        maxSupply: 1000,
        mintPrice: 0.01,
      };
      nftModuleMock.createIPCollection.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.createIPCollection(data);

      expect(nftModuleMock.createIPCollection).toHaveBeenCalledWith(data, '0x');
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

      expect(nftModuleMock.mintFromCollection).toHaveBeenCalledWith(data, '0x');
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

      expect(nftModuleMock.mintFromProtocolCollection).toHaveBeenCalledWith(data, '0x');
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

      expect(nftModuleMock.mintIPFromIPCollection).toHaveBeenCalledWith(data, '0x');
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

      expect(ipModuleMock.registerNFT).toHaveBeenCalledWith(data, '0x');
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('registerDerivates', () => {
    it('should call registerDerivates on IPModule with the correct data', async () => {
      const data: IRegisterDerivative = {
        parentIP: '0x',
        tokenContract: '0x',
        tokenId: 1,
        isMintAllowed: false,
        ipSupply: 0,
        isUnlimitedSupply: false,
        mintPrice: 0,
      };
      ipModuleMock.registerDerivates.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.registerDerivates(data);

      expect(ipModuleMock.registerDerivates).toHaveBeenCalledWith(data, '0x');
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('buyIPNFT', () => {
    it('should call buyIPNFT on IPModule with the correct data', async () => {
      const data: IBuyIPNFT = {
        ip: '0x',
        recipient: '0x',
      };
      ipModuleMock.buyIPNFT.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.buyIPNFT(data);

      expect(ipModuleMock.buyIPNFT).toHaveBeenCalledWith(data);
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('createSmartLicense', () => {
    it('should call createSmartLicense with the correct data', async () => {
      const data: ICreateSmartLicense = {
        isCommercialUseAllowed: false,
        isDerivativeAllowed: false,
        isExpirable: false,
        isRoyaltyAllowed: false,
        royaltyPercentage: 0,
        licenseFee: 0.0001,
      };
      licenseModuleMock.createSmartLicense.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.createSmartLicense(data);

      expect(licenseModuleMock.createSmartLicense).toHaveBeenCalled();
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('createCustomLicense', () => {
    it('should call createCustomLicense with the correct data', async () => {
      const data: ICreateCustomLicense = {
        isCommercialUseAllowed: false,
        isDerivativeAllowed: false,
        isExpirable: false,
        isRoyaltyAllowed: false,
        royaltyPercentage: 0,
        licenseFee: 0.0001,
        customKeys: {},
      };
      licenseModuleMock.createCustomLicense.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.createCustomLicense(data);

      expect(licenseModuleMock.createCustomLicense).toHaveBeenCalled();
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('attachSmartLicense', () => {
    it('should call createCustomLicense with the correct data', async () => {
      const data: IAttachLicense = {
        ipId: '0x',
        licenseTermId: 1,
      };
      licenseModuleMock.attachSmartLicense.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.attachSmartLicense(data);

      expect(licenseModuleMock.attachSmartLicense).toHaveBeenCalled();
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('attachCustomLicense', () => {
    it('should call attachCustomLicense with the correct data', async () => {
      const data: IAttachLicense = {
        ipId: '0x',
        licenseTermId: 1,
      };
      licenseModuleMock.attachCustomLicense.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.attachCustomLicense(data);

      expect(licenseModuleMock.attachCustomLicense).toHaveBeenCalled();
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('updateSmartLicense', () => {
    it('should call updateSmartLicense with the correct data', async () => {
      const data: IAttachLicense = {
        ipId: '0x',
        licenseTermId: 1,
      };
      licenseModuleMock.updateSmartLicense.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.updateSmartLicense(data);

      expect(licenseModuleMock.updateSmartLicense).toHaveBeenCalled();
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('updateCustomLicense', () => {
    it('should call updateCustomLicense with the correct data', async () => {
      const data: IAttachLicense = {
        ipId: '0x',
        licenseTermId: 1,
      };
      licenseModuleMock.updateCustomLicense.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.updateCustomLicense(data);

      expect(licenseModuleMock.updateCustomLicense).toHaveBeenCalled();
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });

  describe('getLicenseFee', () => {
    it('should call getLicenseFee with the correct data', async () => {
      ipModuleMock.getLicenseFee.mockResolvedValueOnce(BigInt(0));

      await base.getLicenseFee('0x');

      expect(ipModuleMock.getLicenseFee).toHaveBeenCalled();
    });
  });

  describe('activateRoyalty', () => {
    it('should call activateRoyalty with the correct data', async () => {
      const data: IActivateRoyalty = {
        ip: '0x',
        mintRTSupply: 1000,
        royaltyTokenName: 'Test',
        royaltyTokenSymbol: 'TST',
      };
      royaltyDistributionModuleMock.activateRoyalty.mockResolvedValueOnce({
        transactionResponse: { transactionHash: '0x' },
      } as any);

      const result = await base.activateRoyalty(data);

      expect(royaltyDistributionModuleMock.activateRoyalty).toHaveBeenCalled();
      expect(result?.transactionResponse?.transactionHash).toBe('0x');
    });
  });
});
