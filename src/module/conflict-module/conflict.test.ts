import { readContract, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { ConflictModule } from '.';
import { IRaiseConflict } from '../../types';

// Mocking dependencies
jest.mock('@wagmi/core', () => ({
  readContract: jest.fn(),
  waitForTransactionReceipt: jest.fn().mockResolvedValue({
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
    ],
  }),
  writeContract: jest.fn(),
}));

jest.mock('../../utils', () => ({
  getConfig: jest.fn(),
  getApiUrl: jest.fn(),
  getContractAddresses: jest.fn().mockResolvedValue({
    IP_CONTRACT_ADDRESS: '0x',
    NFT_CONTRACT_ADDRESS: '0x',
    LICENSE_CONTRACT_ADDRESS: '0x',
  }),
  generateSignatureForConflicts: jest
    .fn()
    .mockResolvedValue({ encodedData: '0x', signature: '0x' }),
}));

jest.mock('../../abis/conflict-module', () => ({
  conflictModuleAbi: 'mock-conflict-module-abi',
}));

jest.mock('../../abis/rev-token', () => ({
  revTokenAbi: 'mock-rev-token-abi',
}));

jest.mock('viem', () => ({
  decodeEventLog: jest.fn().mockResolvedValue({
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
    ],
  }),
}));

jest.mock('../../main', () => ({
  getConfig: jest.fn(),
  getKey: jest.fn(),
}));

describe('ConflictModule', () => {
  let conflictModule: ConflictModule;

  let mockWriteContract: jest.Mock;
  let mockWaitForTransactionReceipt: jest.Mock;
  let mockReadContract: jest.Mock;

  beforeEach(() => {
    conflictModule = new ConflictModule();

    mockWriteContract = writeContract as jest.Mock;
    mockWaitForTransactionReceipt = waitForTransactionReceipt as jest.Mock;
    mockReadContract = readContract as jest.Mock;

    jest.clearAllMocks();
  });

  describe('raiseConflict', () => {
    it('should throw an error if evidenceLink is not provided', async () => {
      const input: IRaiseConflict = { tier: 1, ip: '0x', evidenceLink: '' };
      const address = '0x123';

      await expect(conflictModule.raiseConflict(input, address)).rejects.toThrow(
        'Evidence link is required'
      );
    });

    it('should approve royalty amount and raise a conflict', async () => {
      const input: IRaiseConflict = { tier: 1, ip: '0x', evidenceLink: 'http://example.com' };
      const address = '0x123';
      const tierDetails = [1000];
      const approvalData = { message: 'approval-transaction-hash', status: 'success' };
      const transactionData = 'transaction-hash';
      const transactionResponse = {
        status: 'success',
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
        ],
      };

      mockReadContract.mockResolvedValue(tierDetails);
      mockWriteContract.mockResolvedValue(approvalData);

      mockWriteContract.mockResolvedValue(transactionData);
      mockWaitForTransactionReceipt.mockResolvedValueOnce(transactionResponse);

      await conflictModule.raiseConflict(input, address);

      expect(mockWriteContract).toHaveBeenCalledTimes(2); // approve + raiseConflictEncoded
    });

    it('should throw an error if approval transaction fails', async () => {
      const input: IRaiseConflict = { tier: 1, ip: '0x', evidenceLink: 'http://example.com' };
      const address = '0x123';
      const tierDetails = [1000];
      const approvalData = 'approval-transaction-hash';
      const approvalTransactionResponse = {
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
        ],
      };

      mockReadContract.mockResolvedValue(tierDetails);
      mockWriteContract.mockResolvedValue(approvalData);
      mockWaitForTransactionReceipt.mockResolvedValueOnce(approvalTransactionResponse);

      await expect(conflictModule.raiseConflict(input, address)).rejects.toThrow(
        'Failed to approve royalty amount'
      );
    });
  });

  describe('resolveConflict', () => {
    it('should resolve conflict successfully', async () => {
      const input = { conflictId: 1, isValidConflict: true };
      const address = '0x123';
      const transactionData = 'transaction-hash';
      const transactionResponse = {
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
        ],
      };

      mockWriteContract.mockResolvedValue(transactionData);
      mockWaitForTransactionReceipt.mockResolvedValueOnce(transactionResponse);

      await conflictModule.resolveConflict(input, address);

      expect(mockWriteContract).toHaveBeenCalled();
    });
  });

  describe('cancelConflict', () => {
    it('should cancel conflict successfully', async () => {
      const input = { conflictId: 1 };
      const address = '0x123';
      const transactionData = 'transaction-hash';
      const transactionResponse = {
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
        ],
      };

      mockWriteContract.mockResolvedValue(transactionData);
      mockWaitForTransactionReceipt.mockResolvedValueOnce(transactionResponse);

      await conflictModule.cancelConflict(input, address);

      expect(mockWriteContract).toHaveBeenCalled();
    });
  });
});
