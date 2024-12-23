import { generateSignature, isValidURL } from '../../utils';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { decodeEventLog } from 'viem';
import { NFTModule } from '.';
import {
  ICreateIPCollection,
  IMintFromCollection,
  IMintFromProtocolCollection,
  IMintIPFromIPCollection,
} from '../../types';

const mockTransactionResponse = {
  logs: [
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

// Mocking external dependencies
jest.mock('../../utils', () => ({
  generateSignature: jest.fn(),
  getConfig: jest.fn(),
  getContractAddresses: jest.fn().mockResolvedValue({
    NFT_CONTRACT_ADDRESS: '0x',
    IP_CONTRACT_ADDRESS: '0x',
  }),
  isValidURL: jest.fn(),
  validateInputs: jest.fn(),
}));

jest.mock('../../main', () => ({
  getConfig: jest.fn(),
  getKey: jest.fn(),
}));

jest.mock('@wagmi/core', () => ({
  writeContract: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
  readContract: jest.fn().mockResolvedValue(BigInt(1)),
}));

jest.mock('viem', () => ({
  decodeEventLog: jest.fn().mockResolvedValue({ args: ['arg1', 'arg2'] }),
  parseUnits: jest.fn().mockReturnValue('10'),
}));

// NFTModule instance
const nftModule = new NFTModule();

describe('NFTModule', () => {
  const address = '0x1234567890abcdef1234567890abcdef12345678'; // Example address

  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock calls before each test
  });

  it('should create a collection successfully', async () => {
    const input = { name: 'Collection1', symbol: 'COL1' };
    const encodedData = 'encodedData';
    const signature = 'signature';

    // Mocking the responses
    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('mockData');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(mockTransactionResponse);
    (decodeEventLog as jest.Mock).mockResolvedValue({ args: ['arg1', 'arg2'] });

    await nftModule.createCollection(input, address);

    expect(generateSignature).toHaveBeenCalledWith(address);
    expect(writeContract).toHaveBeenCalled();
    expect(waitForTransactionReceipt).toHaveBeenCalled();
    expect(decodeEventLog).toHaveBeenCalled();
  });

  it('should create an IP collection successfully', async () => {
    const input: ICreateIPCollection = {
      name: 'IPCollection1',
      symbol: 'IPCOL1',
      mintPrice: 1.0,
      maxSupply: 100,
      licensors: ['0x', '0x', '0x'],
    };
    const encodedData = 'encodedData';
    const signature = 'signature';

    // Mocking the responses
    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('mockData');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(mockTransactionResponse);
    (decodeEventLog as jest.Mock).mockResolvedValue({ args: ['arg1', 'arg2'] });

    await nftModule.createIPCollection(input, address);

    expect(generateSignature).toHaveBeenCalledWith(address);
    expect(writeContract).toHaveBeenCalled();

    expect(waitForTransactionReceipt).toHaveBeenCalled();
    expect(decodeEventLog).toHaveBeenCalled();
  });

  it('should mint from collection successfully', async () => {
    const input: IMintFromCollection = {
      collectionAddress: '0x123456',
      recipientAddress: '0xabcdef',
      metadataURI: 'https://example.com/metadata',
    };
    const encodedData = 'encodedData';
    const signature = 'signature';

    // Mocking the responses
    (isValidURL as jest.Mock).mockReturnValue(true);
    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('mockData');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(mockTransactionResponse);
    (decodeEventLog as jest.Mock).mockResolvedValue({ args: ['arg1', 'arg2'] });

    await nftModule.mintFromCollection(input, address);

    expect(isValidURL).toHaveBeenCalledWith(input.metadataURI);
    expect(generateSignature).toHaveBeenCalledWith(address);
    expect(writeContract).toHaveBeenCalled();

    expect(waitForTransactionReceipt).toHaveBeenCalled();
    expect(decodeEventLog).toHaveBeenCalled();
  });

  it('should mint from protocol collection successfully', async () => {
    const input: IMintFromProtocolCollection = {
      recipientAddress: '0xabcdef',
      metadataURI: 'https://example.com/metadata',
    };
    const encodedData = 'encodedData';
    const signature = 'signature';

    // Mocking the responses
    (isValidURL as jest.Mock).mockReturnValue(true);
    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('mockData');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(mockTransactionResponse);
    (decodeEventLog as jest.Mock).mockResolvedValue({ args: ['arg1', 'arg2'] });

    await nftModule.mintFromProtocolCollection(input, address);

    expect(isValidURL).toHaveBeenCalledWith(input.metadataURI);
    expect(generateSignature).toHaveBeenCalledWith(address);
    expect(writeContract).toHaveBeenCalled();

    expect(waitForTransactionReceipt).toHaveBeenCalled();
    expect(decodeEventLog).toHaveBeenCalled();
  });

  it('should mint IP from IP collection successfully', async () => {
    const input: IMintIPFromIPCollection = {
      ipID: '0x',
      recipientAddress: '0xabcdef',
      uri: 'https://example.com/metadata',
      isMintAllowed: true,
      isUnlimitedSupply: false,
      ipSupply: 100,
      mintPrice: 1.0,
    };
    const encodedData = 'encodedData';
    const signature = 'signature';

    // Mocking the responses
    (isValidURL as jest.Mock).mockReturnValue(true);
    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('mockData');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(mockTransactionResponse);
    (decodeEventLog as jest.Mock).mockResolvedValue({ args: ['arg1', 'arg2'] });

    await nftModule.mintIPFromIPCollection(input, address);

    expect(isValidURL).toHaveBeenCalledWith(input.uri);
    expect(generateSignature).toHaveBeenCalledWith(address);
    expect(writeContract).toHaveBeenCalled();

    expect(waitForTransactionReceipt).toHaveBeenCalled();
    expect(decodeEventLog).toHaveBeenCalled();
  });
});
