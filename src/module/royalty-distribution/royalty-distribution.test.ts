import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { generateSignature, getContractAddresses, validateInputs } from '../../utils';
import { decodeEventLog } from 'viem';

import { getConfig } from '../../main';
import { RoyaltyDistributionModule } from '.';
import { IActivateRoyalty, ICollectRevenue, IPayRoyalty } from '../../types';

jest.mock('@wagmi/core', () => ({
  writeContract: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
}));

jest.mock('../../utils', () => ({
  generateSignature: jest.fn(),
  getContractAddresses: jest.fn(),
  validateInputs: jest.fn(),
}));

jest.mock('viem', () => ({
  decodeEventLog: jest.fn(),
  parseUnits: jest.fn(),
}));

jest.mock('../../main', () => ({
  getConfig: jest.fn(),
  getKey: jest.fn(),
}));

const mockWriteContract = writeContract as jest.Mock;
const mockWaitForTransactionReceipt = waitForTransactionReceipt as jest.Mock;
const mockGenerateSignature = generateSignature as jest.Mock;
const mockGetContractAddresses = getContractAddresses as jest.Mock;
const mockDecodeEventLog = decodeEventLog as jest.Mock;
const mockValidateInputs = validateInputs as jest.Mock;
const mockGetConfig = getConfig as jest.Mock;

describe('RoyaltyDistributionModule', () => {
  let royaltyDistributionModule: RoyaltyDistributionModule;

  beforeEach(() => {
    royaltyDistributionModule = new RoyaltyDistributionModule();
    mockGetConfig.mockReturnValue('mockConfig');
    mockGetContractAddresses.mockReturnValue({
      ROYALTY_DISTRIBUTION_CONTRACT_ADDRESS: '0xMockAddress',
      REV_TOKEN_CONTRACT_ADDRESS: '0xMockRevTokenAddress',
    });
  });

  describe('activateRoyalty', () => {
    it('should successfully activate royalty', async () => {
      const input: IActivateRoyalty = {
        royaltyTokenName: 'MockToken',
        royaltyTokenSymbol: 'MKT',
        mintRTSupply: 100,
        ip: '0x',
      };
      const address = '0xMockAddress';
      const encodedData = 'mockEncodedData';
      const signature = 'mockSignature';
      const transactionResponse = { logs: [{}, {}, { data: 'mockData', topics: ['mockTopic'] }] };

      mockGenerateSignature.mockResolvedValue({ encodedData, signature });
      mockWriteContract.mockResolvedValue('mockTransactionHash');
      mockWaitForTransactionReceipt.mockResolvedValue(transactionResponse);
      mockDecodeEventLog.mockReturnValue({
        args: { mockKey: 'mockValue' },
        eventName: 'MockEvent',
      });

      const result = await royaltyDistributionModule.activateRoyalty(input, address);

      expect(result.transactionResponse).toBe(transactionResponse);
      expect(result.result).toEqual({ mockKey: 'mockValue' });
      expect(mockValidateInputs).toHaveBeenCalledWith([
        input.royaltyTokenName,
        input.royaltyTokenSymbol,
      ]);
      expect(mockWriteContract).toHaveBeenCalled();
    });

    it('should throw an error if contract call fails', async () => {
      const input: IActivateRoyalty = {
        royaltyTokenName: 'MockToken',
        royaltyTokenSymbol: 'MKT',
        mintRTSupply: 100,
        ip: '0x',
      };
      const address = '0xMockAddress';

      mockWriteContract.mockRejectedValue(new Error('Contract call failed'));

      await expect(royaltyDistributionModule.activateRoyalty(input, address)).rejects.toThrow(
        'Contract call failed'
      );
    });
  });

  describe('payRoyalty', () => {
    it('should successfully pay royalty', async () => {
      const input: IPayRoyalty = { amount: 100, ip: '0xMockIP' };
      const address = '0xMockAddress';
      const transactionResponse = {
        status: 'success',
        logs: [
          { data: 'mockData', topics: ['mockTopic'] },
          { data: 'mockData', topics: ['mockTopic'] },
          { data: 'mockData', topics: ['mockTopic'] },
          { data: 'mockData', topics: ['mockTopic'] },
        ],
      };
      const encodedData = 'mockEncodedData';
      const signature = 'mockSignature';

      mockWriteContract.mockResolvedValue('mockTransactionHash');
      mockWaitForTransactionReceipt.mockResolvedValue(transactionResponse);
      mockGenerateSignature.mockResolvedValue({ encodedData, signature });
      mockDecodeEventLog.mockReturnValue({
        args: { mockKey: 'mockValue' },
        eventName: 'MockEvent',
      });

      await royaltyDistributionModule.payRoyalty(input, address);

      expect(mockWriteContract).toHaveBeenCalled();
      expect(mockWaitForTransactionReceipt).toHaveBeenCalled();
    });

    it('should throw an error if amount is invalid', async () => {
      const input: IPayRoyalty = { amount: 0, ip: '0xMockIP' };
      const address = '0xMockAddress';

      await expect(royaltyDistributionModule.payRoyalty(input, address)).rejects.toThrow(
        'Invalid amount! Please provide a valid amount to pay royalty'
      );
    });

    it('should throw an error if approval fails', async () => {
      const input: IPayRoyalty = { amount: 100, ip: '0xMockIP' };
      const address = '0xMockAddress';

      mockWaitForTransactionReceipt.mockResolvedValue({ status: 'failure' });

      await expect(royaltyDistributionModule.payRoyalty(input, address)).rejects.toThrow(
        'Failed to approve royalty amount'
      );
    });
  });

  describe('collectRevenue', () => {
    it('should successfully collect revenue', async () => {
      const input: ICollectRevenue = { ip: '0xMockIP', snapshotId: 1 };
      const address = '0xMockAddress';
      const encodedData = 'mockEncodedData';
      const signature = 'mockSignature';
      const transactionResponse = { logs: [{}, { data: 'mockData', topics: ['mockTopic'] }] };

      mockGenerateSignature.mockResolvedValue({ encodedData, signature });
      mockWriteContract.mockResolvedValue('mockTransactionHash');
      mockWaitForTransactionReceipt.mockResolvedValue(transactionResponse);
      mockDecodeEventLog.mockReturnValue({
        args: { mockKey: 'mockValue' },
        eventName: 'MockEvent',
      });

      await royaltyDistributionModule.collectRevenue(input, address);

      expect(mockWriteContract).toHaveBeenCalled();
      expect(mockWaitForTransactionReceipt).toHaveBeenCalled();
    });

    it('should throw an error if contract call fails', async () => {
      const input: ICollectRevenue = { ip: '0xMockIP', snapshotId: 1 };
      const address = '0xMockAddress';

      mockWriteContract.mockRejectedValue(new Error('Contract call failed'));

      await expect(royaltyDistributionModule.collectRevenue(input, address)).rejects.toThrow(
        'Contract call failed'
      );
    });
  });
});
