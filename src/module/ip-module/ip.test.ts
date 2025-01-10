import { readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig, getKey } from '../../main';
import { OnChainIPModule } from '../ip-module';
import { decodeEventLog } from 'viem';
import { getApiUrl, getContractAddresses } from '../../utils';
import { IBuyIPNFT } from '../../types';

jest.mock('@wagmi/core', () => ({
  writeContract: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
  readContract: jest.fn().mockResolvedValue({ licenseTermId: 1, licenseFee: 1 }),
}));

jest.mock('../../main', () => ({
  getConfig: jest.fn(),
  getKey: jest.fn(),
}));

jest.mock('viem', () => ({
  decodeEventLog: jest.fn(),
  parseUnits: jest.fn().mockReturnValue('10'),
}));

jest.mock('../../utils', () => ({
  getApiUrl: jest.fn(),
  getContractAddresses: jest.fn().mockResolvedValue({
    IP_CONTRACT_ADDRESS: '0x',
    NFT_CONTRACT_ADDRESS: '0x',
    LICENSE_CONTRACT_ADDRESS: '0x',
  }),
  generateSignature: jest.fn().mockResolvedValue({ encodedData: '0x', signature: '0x' }),
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
        {
          data: 'mock-log-data',
          topics: ['mock-topic'],
        },
        {
          data: 'mock-log-data',
          topics: ['mock-topic'],
        },
        {
          data: 'mock-log-data',
          topics: ['mock-topic'],
        },
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
        ipSupply: 0,
        isMintAllowed: false,
        isUnlimitedSupply: false,
        mintPrice: 0,
      },
      '0x'
    );

    // Assertions
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

  describe('IPModule registerDerivates', () => {
    it('should register Derivatives and return transaction response and topics', async () => {
      // Similar setup as for registerNFT
      const mockConfig = { chains: [{ id: 1 }] };
      const mockApiKey = 'mock-api-key';
      const mockApiUrl = 'http://mock-api-url';

      const mockTransactionHash = 'mock-transaction-hash';
      const mockTransactionReceipt = {
        logs: [
          {},
          {},
          {
            data: 'mock-log-data',
            topics: ['mock-topic'],
          },
          {
            data: 'mock-log-data',
            topics: ['mock-topic'],
          },
          {
            data: 'mock-log-data',
            topics: ['mock-topic'],
          },
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

      (writeContract as jest.Mock).mockResolvedValue(mockTransactionHash);
      (waitForTransactionReceipt as jest.Mock).mockResolvedValue(mockTransactionReceipt);
      (decodeEventLog as jest.Mock).mockReturnValue(mockDecodedTopics);

      // Call the method
      const result = await ipModule.registerDerivates(
        {
          parentIP: '0x',
          tokenId: 1,
          tokenContract: '0x',
          ipSupply: 0,
          isMintAllowed: false,
          isUnlimitedSupply: false,
          mintPrice: 0,
        },
        '0x'
      );

      // Assertions
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
      (writeContract as jest.Mock).mockRejectedValue({ message: 'Invalid API Key' });

      // Call the method and expect an error
      await expect(
        ipModule.registerDerivates(
          {
            parentIP: '0x',
            tokenId: 1,
            tokenContract: '0x',
            ipSupply: 0,
            isMintAllowed: false,
            isUnlimitedSupply: false,
            mintPrice: 0,
          },
          '0x'
        )
      ).rejects.toThrow('Invalid API Key');
    });
  });
});

describe('getLicenseFee', () => {
  let ipModule: OnChainIPModule;

  beforeEach(() => {
    ipModule = new OnChainIPModule();
    jest.clearAllMocks();
  });
  const mockGetConfig = getConfig as jest.Mock;
  const mockGetContractAddresses = getContractAddresses as jest.Mock;
  const mockReadContract = readContract as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the license fee for the provided parent IP', async () => {
    const mockConfig = { some: 'config' };
    const mockAddresses = {
      IP_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
      LICENSE_CONTRACT_ADDRESS: '0xabcdefabcdefabcdefabcdefabcdefabcdef',
    };
    const mockLicenseTermId = 1;
    const mockLicenseFee = BigInt(500);

    // Mock the return values
    mockGetConfig.mockReturnValue(mockConfig);
    mockGetContractAddresses.mockReturnValue(mockAddresses);
    mockReadContract
      .mockResolvedValueOnce({ licenseTermId: mockLicenseTermId }) // First call to readContract
      .mockResolvedValueOnce({ licenseFee: mockLicenseFee }); // Second call to readContract

    const result = await ipModule.getLicenseFee('parentIPValue');

    // Assertions
    expect(mockReadContract).toHaveBeenCalledTimes(2);

    expect(mockReadContract).toHaveBeenNthCalledWith(1, mockConfig, {
      abi: expect.anything(), // Replace with the actual ABI if necessary
      functionName: 'getIPAsset',
      address: mockAddresses.IP_CONTRACT_ADDRESS,
      args: ['parentIPValue'],
    });

    expect(mockReadContract).toHaveBeenNthCalledWith(2, mockConfig, {
      abi: expect.anything(), // Replace with the actual ABI if necessary
      functionName: 'getLicense',
      address: mockAddresses.LICENSE_CONTRACT_ADDRESS,
      args: [mockLicenseTermId],
    });

    expect(result).toBe(mockLicenseFee);
  });

  it('should throw an error if the license term ID cannot be retrieved', async () => {
    const mockConfig = { some: 'config' };
    const mockAddresses = {
      IP_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
    };

    // Mock the return values
    mockGetConfig.mockReturnValue(mockConfig);
    mockGetContractAddresses.mockReturnValue(mockAddresses);
    mockReadContract.mockResolvedValueOnce(null); // First call to readContract returns null

    await expect(ipModule.getLicenseFee('parentIPValue')).rejects.toThrow();

    expect(mockReadContract).toHaveBeenCalledTimes(1);
    expect(mockReadContract).toHaveBeenCalledWith(mockConfig, {
      abi: expect.anything(), // Replace with the actual ABI if necessary
      functionName: 'getIPAsset',
      address: mockAddresses.IP_CONTRACT_ADDRESS,
      args: ['parentIPValue'],
    });
  });
});

describe('buyIPNFT', () => {
  const mockGetConfig = getConfig as jest.Mock;
  const mockGetContractAddresses = getContractAddresses as jest.Mock;
  const mockReadContract = readContract as jest.Mock;
  const mockWriteContract = writeContract as jest.Mock;
  const mockWaitForTransactionReceipt = waitForTransactionReceipt as jest.Mock;
  const mockDecodeEventLog = decodeEventLog as jest.Mock;
  let ipModule: OnChainIPModule;

  beforeEach(() => {
    ipModule = new OnChainIPModule();
    jest.clearAllMocks();
  });

  it('should successfully buy an IPNFT and decode the event log', async () => {
    const mockConfig = { some: 'config' };
    const mockAddresses = {
      IP_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678',
    };
    const mockMintPrice = BigInt(1000);
    const mockTransactionHash =
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const mockTransactionReceipt = {
      logs: [
        {},
        {},
        {
          data: '0xlogdata',
          topics: ['0xtopic1', '0xtopic2'],
        },
      ],
    };
    const mockDecodedEvent = { args: { someKey: 'someValue' } };

    const input: IBuyIPNFT = { ip: '0x', recipient: '0x' };

    // Mock the return values
    mockGetConfig.mockReturnValue(mockConfig);
    mockGetContractAddresses.mockReturnValue(mockAddresses);
    mockReadContract.mockResolvedValueOnce(mockMintPrice); // First call to readContract
    mockWriteContract.mockResolvedValueOnce(mockTransactionHash); // Call to writeContract
    mockWaitForTransactionReceipt.mockResolvedValueOnce(mockTransactionReceipt); // Call to waitForTransactionReceipt
    mockDecodeEventLog.mockReturnValueOnce(mockDecodedEvent); // Call to decodeEventLog

    const result = await ipModule.buyIPNFT(input);

    // Assertions
    expect(mockReadContract).toHaveBeenCalledWith(mockConfig, {
      abi: expect.anything(), // Replace with the actual ABI
      functionName: 'getIpMintPrice',
      address: mockAddresses.IP_CONTRACT_ADDRESS,
      args: [input.ip],
    });

    expect(mockWriteContract).toHaveBeenCalledWith(mockConfig, {
      abi: expect.anything(), // Replace with the actual ABI
      address: mockAddresses.IP_CONTRACT_ADDRESS,
      functionName: 'buyIpNft',
      args: [input.ip, input.recipient],
      value: mockMintPrice,
    });

    expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(mockConfig, {
      hash: mockTransactionHash,
    });

    expect(mockDecodeEventLog).toHaveBeenCalledWith({
      abi: expect.anything(), // Replace with the actual ABI
      data: mockTransactionReceipt.logs[2].data,
      topics: mockTransactionReceipt.logs[2].topics,
    });

    expect(result).toEqual({
      transactionResponse: mockTransactionReceipt,
      result: { ...mockDecodedEvent.args },
    });
  });

  it('should throw an error if mint price retrieval fails', async () => {
    const mockConfig = { some: 'config' };
    const mockAddresses = { IP_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678' };
    const input: IBuyIPNFT = { ip: '0x', recipient: '0x' };

    mockGetConfig.mockReturnValue(mockConfig);
    mockGetContractAddresses.mockReturnValue(mockAddresses);
    mockReadContract.mockRejectedValueOnce(new Error('Failed to fetch mint price'));

    await expect(ipModule.buyIPNFT(input)).rejects.toThrow('Failed to fetch mint price');
  });

  it('should throw an error if transaction receipt is not returned', async () => {
    const mockConfig = { some: 'config' };
    const mockAddresses = { IP_CONTRACT_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678' };
    const mockMintPrice = BigInt(1000);
    const mockTransactionHash =
      '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    const input: IBuyIPNFT = { ip: '0x', recipient: '0x' };

    mockGetConfig.mockReturnValue(mockConfig);
    mockGetContractAddresses.mockReturnValue(mockAddresses);
    mockReadContract.mockResolvedValueOnce(mockMintPrice);
    mockWriteContract.mockResolvedValueOnce(mockTransactionHash);
    mockWaitForTransactionReceipt.mockResolvedValueOnce(null);

    await expect(ipModule.buyIPNFT(input)).rejects.toThrow();
  });
});
