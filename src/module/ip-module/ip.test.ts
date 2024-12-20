import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig, getKey } from '../../main';
import { OnChainIPModule } from '../ip-module';
import { decodeEventLog } from 'viem';
import { getApiUrl } from '../../utils';

jest.mock('@wagmi/core', () => ({
  writeContract: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
}));

jest.mock('../../main', () => ({
  getConfig: jest.fn(),
  getKey: jest.fn(),
}));

jest.mock('viem', () => ({
  decodeEventLog: jest.fn(),
}));

jest.mock('../../utils', () => ({
  getApiUrl: jest.fn(),
  getContractAddresses: jest.fn().mockResolvedValue({
    IP_CONTRACT_ADDRESS: '0x',
    NFT_CONTRACT_ADDRESS: '0x',
    LICENSE_CONTRACT_ADDRESS: '0x',
  }),
}));

describe('IPModule', () => {
  let ipModule: OnChainIPModule;

  beforeEach(() => {
    ipModule = new OnChainIPModule();
    jest.clearAllMocks();
  });

  it('should register NFT and return transaction response and topics', async () => {
    // Mocking the necessary dependencies
    const mockConfig = { chains: [{ id: 1 }] };
    const mockApiKey = 'mock-api-key';
    const mockApiUrl = 'http://mock-api-url';
    const mockEncodedData = 'mock-encoded-data';
    const mockSignature = 'mock-signature';
    const mockTransactionHash = 'mock-transaction-hash';
    const mockTransactionReceipt = {
      logs: [
        {},
        {},
        {
          data: 'mock-log-data',
          topics: ['mock-topic'],
        },
      ],
    };
    const mockDecodedTopics = { args: { result: 'mock-result' } };

    // Mocking implementations
    (getConfig as jest.Mock).mockReturnValue(mockConfig);
    (getKey as jest.Mock).mockReturnValue(mockApiKey);
    (getApiUrl as jest.Mock).mockReturnValue(mockApiUrl);
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ encodedData: mockEncodedData, signature: mockSignature }),
    });
    (writeContract as jest.Mock).mockResolvedValue(mockTransactionHash);
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(mockTransactionReceipt);
    (decodeEventLog as jest.Mock).mockReturnValue(mockDecodedTopics);

    // Call the method
    const result = await ipModule.registerNFT(
      {
        licensors: ['0x', '0x', '0x'],
        tokenContract: '0x',
        tokenId: 1,
      },
      '0x'
    );

    // Assertions
    expect(global.fetch).toHaveBeenCalled();
    expect(writeContract).toHaveBeenCalled();
    expect(waitForTransactionReceipt).toHaveBeenCalledWith(mockConfig, {
      hash: mockTransactionHash,
    });
    expect(decodeEventLog).toHaveBeenCalled();
    expect(result).toEqual({
      transactionResponse: mockTransactionReceipt,
      result: { result: 'mock-result' },
    });
  });

  it('should throw an error if registerNFT API call fails', async () => {
    // Mocking the necessary dependencies
    const mockConfig = { chains: [{ id: 1 }] };
    const mockApiKey = 'mock-api-key';
    const mockApiUrl = 'http://mock-api-url';

    // Mocking implementations
    (getConfig as jest.Mock).mockReturnValue(mockConfig);
    (getKey as jest.Mock).mockReturnValue(mockApiKey);
    (getApiUrl as jest.Mock).mockReturnValue(mockApiUrl);
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: 'Invalid API Key' }),
    });

    await expect(
      ipModule.registerNFT(
        {
          licensors: ['0x', '0x', '0x'],
          tokenContract: '0x',
          tokenId: 1,
        },
        '0x'
      )
    ).rejects.toThrow('Invalid API Key');
  });
  describe('IPModule registerDerivates', () => {
    it('should register Derivatives and return transaction response and topics', async () => {
      // Similar setup as for registerNFT
      const mockConfig = { chains: [{ id: 1 }] };
      const mockApiKey = 'mock-api-key';
      const mockApiUrl = 'http://mock-api-url';
      const mockEncodedData = 'mock-encoded-data';
      const mockSignature = 'mock-signature';
      const mockTransactionHash = 'mock-transaction-hash';
      const mockTransactionReceipt = {
        logs: [
          {},
          {},
          {
            data: 'mock-log-data',
            topics: ['mock-topic'],
          },
        ],
      };
      const mockDecodedTopics = { args: { result: 'mock-result' } };

      // Mock implementations
      (getConfig as jest.Mock).mockReturnValue(mockConfig);
      (getKey as jest.Mock).mockReturnValue(mockApiKey);
      (getApiUrl as jest.Mock).mockReturnValue(mockApiUrl);
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue({ encodedData: mockEncodedData, signature: mockSignature }),
      });
      (writeContract as jest.Mock).mockResolvedValue(mockTransactionHash);
      (waitForTransactionReceipt as jest.Mock).mockResolvedValue(mockTransactionReceipt);
      (decodeEventLog as jest.Mock).mockReturnValue(mockDecodedTopics);

      // Call the method
      const result = await ipModule.registerDerivates(
        {
          parentIP: '0x',
          tokenId: 1,
          tokenContract: '0x',
        },
        '0x'
      );

      // Assertions
      expect(global.fetch).toHaveBeenCalled();
      expect(writeContract).toHaveBeenCalled();
      expect(waitForTransactionReceipt).toHaveBeenCalledWith(mockConfig, {
        hash: mockTransactionHash,
      });
      expect(decodeEventLog).toHaveBeenCalledWith({
        abi: expect.anything(),
        data: mockTransactionReceipt.logs[2].data,
        topics: mockTransactionReceipt.logs[2].topics,
      });
      expect(result).toEqual({
        transactionResponse: mockTransactionReceipt,
        result: { result: 'mock-result' },
      });
    });

    it('should throw an error if registerDerivates API call fails', async () => {
      // Mocking similar setup as the failure case for registerNFT
      const mockConfig = { chains: [{ id: 1 }] };
      const mockApiKey = 'mock-api-key';
      const mockApiUrl = 'http://mock-api-url';

      // Mocking implementations
      (getConfig as jest.Mock).mockReturnValue(mockConfig);
      (getKey as jest.Mock).mockReturnValue(mockApiKey);
      (getApiUrl as jest.Mock).mockReturnValue(mockApiUrl);
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Invalid API Key' }),
      });

      // Call the method and expect an error
      await expect(
        ipModule.registerDerivates(
          {
            parentIP: '0x',
            tokenId: 1,
            tokenContract: '0x',
          },
          '0x'
        )
      ).rejects.toThrow('Invalid API Key');
    });
  });
});
