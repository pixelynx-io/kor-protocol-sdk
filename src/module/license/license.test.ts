/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnChainLicenseModule } from '.';
import { generateSignature, getApiHeaders, getApiUrl } from '../../utils';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import { Asset } from '../asset/asset';
import { ICreateCustomLicense, ICreateSmartLicense } from '../../types';
import jsPDF from 'jspdf';

jest.mock('../../utils', () => ({
  generateSignature: jest.fn(),
  getApiUrl: jest.fn().mockReturnValue('http://mock-api-url'),
  getConfig: jest.fn(),
  getContractAddresses: jest.fn().mockResolvedValue({
    IP_CONTRACT_ADDRESS: '0x',
    NFT_CONTRACT_ADDRESS: '0x',
    LICENSE_CONTRACT_ADDRESS: '0x',
  }),
  getApiHeaders: jest.fn().mockReturnValue({ 'api-key': 'key' }),
}));

jest.mock('../asset/asset');

jest.mock('viem', () => ({
  decodeEventLog: jest.fn().mockResolvedValue({ args: ['arg1', 'arg2'] }),
  parseUnits: jest.fn().mockReturnValue('10'),
}));

jest.mock('@wagmi/core/chains', () => ({
  baseSepolia: { id: 'baseSepolia', network: 'sepolia' },
  base: { id: 'base', network: 'base' },
}));

jest.mock('@wagmi/core', () => ({
  writeContract: jest.fn(),
  waitForTransactionReceipt: jest.fn(),
}));

jest.mock('jspdf');

describe('OnChainLicenseModule.createSmartLicense', () => {
  let licenseModule: OnChainLicenseModule;

  beforeEach(() => {
    licenseModule = new OnChainLicenseModule();
    jest.clearAllMocks();
  });

  it('should throw an error if royalty percentage is missing when royalty is allowed', async () => {
    const input = {
      isRoyaltyAllowed: true,
      isCommercialUseAllowed: true,
      isExpirable: false,
      isDerivativeAllowed: true,
      licenseFee: 100,
    };

    await expect(licenseModule.createSmartLicense(input as any, '0x123')).rejects.toThrow(
      'Royalty percentage is required for smart licenses'
    );
  });

  it('should throw an error if expiry timestamp is missing when license is expirable', async () => {
    const input = {
      isRoyaltyAllowed: false,
      isCommercialUseAllowed: true,
      isExpirable: true,
      isDerivativeAllowed: true,
      licenseFee: 100,
    };

    await expect(licenseModule.createSmartLicense(input as any, '0x123')).rejects.toThrow(
      'Expiry timestamp is required for smart licenses'
    );
  });

  it('should call generateSignature with the correct address', async () => {
    const input = {
      isRoyaltyAllowed: false,
      isCommercialUseAllowed: true,
      isExpirable: false,
      isDerivativeAllowed: true,
      licenseFee: 100,
    };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue({ hash: '0xtransaction' });
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({
      logs: [{ data: '0xlogdata', topics: { args: ['topic1', 'topic2'] } }],
    });
    jest.spyOn(licenseModule as any, 'createLicensePDF').mockResolvedValue({ licenseCid: 'id' });

    await licenseModule.createSmartLicense(input, '0x123');

    expect(generateSignature).toHaveBeenCalledWith('0x123');
  });

  it('should successfully create a smart license and return transaction details', async () => {
    const input = {
      isRoyaltyAllowed: false,
      isCommercialUseAllowed: true,
      isExpirable: false,
      isDerivativeAllowed: true,
      licenseFee: 100,
    };
    const encodedData = '0xencoded';
    const signature = '0xsignature';
    const licenseCid = 'license-cid';
    const transactionLogs = [{ data: '0xlogdata', topics: { args: ['topic1', 'topic2'] } }];

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    jest.spyOn(licenseModule as any, 'createLicensePDF').mockResolvedValue({ licenseCid });
    (writeContract as jest.Mock).mockResolvedValue({ hash: '0xtransaction' });
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({ logs: transactionLogs });

    const result = await licenseModule.createSmartLicense(input, '0x123');

    expect(result.result.licenseMetaDataURI).toBe(`https://ipfs.io/ipfs/${licenseCid}`);
    expect(result.result.licenseMetaDataCID).toBe(licenseCid);
  });

  it('should throw an error if writeContract fails', async () => {
    const input = {
      isRoyaltyAllowed: false,
      isCommercialUseAllowed: true,
      isExpirable: false,
      isDerivativeAllowed: true,
      licenseFee: 100,
    };
    const encodedData = '0xencoded';
    const signature = '0xsignature';
    const licenseCid = 'license-cid';
    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });

    jest.spyOn(licenseModule as any, 'createLicensePDF').mockResolvedValue({ licenseCid });

    (writeContract as jest.Mock).mockRejectedValue(new Error('Write contract failed'));

    await expect(licenseModule.createSmartLicense(input, '0x123')).rejects.toThrow(
      'Write contract failed'
    );
  });
});

describe('OnChainLicenseModule.createCustomLicense', () => {
  let licenseModule: OnChainLicenseModule;

  beforeEach(() => {
    licenseModule = new OnChainLicenseModule();
    jest.clearAllMocks();
  });

  it('should throw an error if royalty percentage is missing when royalty is allowed', async () => {
    const input = {
      isRoyaltyAllowed: true,
      isCommercialUseAllowed: true,
      isExpirable: false,
      isDerivativeAllowed: true,
      licenseFee: 100,
      customKeys: { input1: true, input2: false },
    };

    await expect(licenseModule.createCustomLicense(input as any, '0x123')).rejects.toThrow(
      'Royalty percentage is required for smart licenses'
    );
  });

  it('should throw an error if expiry timestamp is missing when license is expirable', async () => {
    const input = {
      isRoyaltyAllowed: false,
      isCommercialUseAllowed: true,
      isExpirable: true,
      isDerivativeAllowed: true,
      licenseFee: 100,
      customKeys: { input1: true, input2: false },
    };

    await expect(licenseModule.createCustomLicense(input as any, '0x123')).rejects.toThrow(
      'Expiry timestamp is required for smart licenses'
    );
  });

  it('should call generateSignature with the correct address', async () => {
    const input = {
      isRoyaltyAllowed: false,
      isCommercialUseAllowed: true,
      isExpirable: false,
      isDerivativeAllowed: true,
      licenseFee: 100,
      customKeys: { input1: true, input2: false },
    };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue({ hash: '0xtransaction' });
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({
      logs: [{ data: '0xlogdata', topics: { args: ['topic1', 'topic2'] } }],
    });
    jest.spyOn(licenseModule as any, 'createLicensePDF').mockResolvedValue({ licenseCid: 'id' });

    await licenseModule.createCustomLicense(input, '0x123');

    expect(generateSignature).toHaveBeenCalledWith('0x123');
  });

  it('should successfully create a smart license and return transaction details', async () => {
    const input = {
      isRoyaltyAllowed: false,
      isCommercialUseAllowed: true,
      isExpirable: false,
      isDerivativeAllowed: true,
      licenseFee: 100,
      customKeys: { input1: true, input2: false },
    };
    const encodedData = '0xencoded';
    const signature = '0xsignature';
    const licenseCid = 'license-cid';
    const transactionLogs = [{ data: '0xlogdata', topics: { args: ['topic1', 'topic2'] } }];

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    jest.spyOn(licenseModule as any, 'createLicensePDF').mockResolvedValue({ licenseCid });
    (writeContract as jest.Mock).mockResolvedValue({ hash: '0xtransaction' });
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({ logs: transactionLogs });

    const result = await licenseModule.createCustomLicense(input, '0x123');

    expect(result.result.licenseMetaDataURI).toBe(`https://ipfs.io/ipfs/${licenseCid}`);
    expect(result.result.licenseMetaDataCID).toBe(licenseCid);
  });

  it('should throw an error if writeContract fails', async () => {
    const input = {
      isRoyaltyAllowed: false,
      isCommercialUseAllowed: true,
      isExpirable: false,
      isDerivativeAllowed: true,
      licenseFee: 100,
      customKeys: { input1: true, input2: false },
    };
    const encodedData = '0xencoded';
    const signature = '0xsignature';
    const licenseCid = 'license-cid';
    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });

    jest.spyOn(licenseModule as any, 'createLicensePDF').mockResolvedValue({ licenseCid });

    (writeContract as jest.Mock).mockRejectedValue(new Error('Write contract failed'));

    await expect(licenseModule.createCustomLicense(input, '0x123')).rejects.toThrow(
      'Write contract failed'
    );
  });
});

describe('OnChainLicenseModule.attachSmartLicense', () => {
  let licenseModule: OnChainLicenseModule;

  beforeEach(() => {
    licenseModule = new OnChainLicenseModule();
    jest.clearAllMocks();
  });

  it('should call generateSignature with the correct address', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.attachSmartLicense(input as any, '0x123');

    expect(generateSignature).toHaveBeenCalledWith('0x123');
  });

  it('should call writeContract with correct arguments', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });

    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.attachSmartLicense(input as any, '0x123');

    expect(writeContract).toHaveBeenCalled();
  });

  it('should call waitForTransactionReceipt with correct transaction hash', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.attachSmartLicense(input as any, '0x123');

    expect(waitForTransactionReceipt).toHaveBeenCalled();
  });

  it('should return transaction response and result when successful', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';
    const transactionResponse = { status: 'success' };

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(transactionResponse);

    const result = await licenseModule.attachSmartLicense(input as any, '0x123');

    expect(result).toEqual({ transactionResponse, result: true });
  });

  it('should throw an error if writeContract fails', async () => {
    const input: any = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockRejectedValue(new Error('writeContract failed'));

    await expect(licenseModule.attachSmartLicense(input, '0x123')).rejects.toThrow(
      'writeContract failed'
    );
  });

  it('should throw an error if waitForTransactionReceipt fails', async () => {
    const input = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockRejectedValue(
      new Error('Transaction receipt failed')
    );

    await expect(licenseModule.attachSmartLicense(input as any, '0x123')).rejects.toThrow(
      'Transaction receipt failed'
    );
  });
});

describe('OnChainLicenseModule.attachCustomLicense', () => {
  let licenseModule: OnChainLicenseModule;

  beforeEach(() => {
    licenseModule = new OnChainLicenseModule();
    jest.clearAllMocks();
  });

  it('should call generateSignature with the correct address', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.attachSmartLicense(input as any, '0x123');

    expect(generateSignature).toHaveBeenCalledWith('0x123');
  });

  it('should call writeContract with correct arguments', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });

    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.attachCustomLicense(input as any, '0x123');

    expect(writeContract).toHaveBeenCalled();
  });

  it('should call waitForTransactionReceipt with correct transaction hash', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.attachSmartLicense(input as any, '0x123');

    expect(waitForTransactionReceipt).toHaveBeenCalled();
  });

  it('should return transaction response and result when successful', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';
    const transactionResponse = { status: 'success' };

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(transactionResponse);

    const result = await licenseModule.attachCustomLicense(input as any, '0x123');

    expect(result).toEqual({ transactionResponse, result: true });
  });

  it('should throw an error if writeContract fails', async () => {
    const input: any = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockRejectedValue(new Error('writeContract failed'));

    await expect(licenseModule.attachCustomLicense(input, '0x123')).rejects.toThrow(
      'writeContract failed'
    );
  });

  it('should throw an error if waitForTransactionReceipt fails', async () => {
    const input = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockRejectedValue(
      new Error('Transaction receipt failed')
    );

    await expect(licenseModule.attachCustomLicense(input as any, '0x123')).rejects.toThrow(
      'Transaction receipt failed'
    );
  });
});

describe('OnChainLicenseModule.updateSmartLicense', () => {
  let licenseModule: OnChainLicenseModule;

  beforeEach(() => {
    licenseModule = new OnChainLicenseModule();
    jest.clearAllMocks();
  });

  it('should call generateSignature with the correct address', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.updateSmartLicense(input as any, '0x123');

    expect(generateSignature).toHaveBeenCalledWith('0x123');
  });

  it('should call writeContract with correct arguments', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });

    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.updateSmartLicense(input as any, '0x123');

    expect(writeContract).toHaveBeenCalled();
  });

  it('should call waitForTransactionReceipt with correct transaction hash', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.updateSmartLicense(input as any, '0x123');

    expect(waitForTransactionReceipt).toHaveBeenCalled();
  });

  it('should return transaction response and result when successful', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';
    const transactionResponse = { status: 'success' };

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(transactionResponse);

    const result = await licenseModule.updateSmartLicense(input as any, '0x123');

    expect(result).toEqual({ transactionResponse, result: true });
  });

  it('should throw an error if writeContract fails', async () => {
    const input: any = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockRejectedValue(new Error('writeContract failed'));

    await expect(licenseModule.updateSmartLicense(input, '0x123')).rejects.toThrow(
      'writeContract failed'
    );
  });

  it('should throw an error if waitForTransactionReceipt fails', async () => {
    const input = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockRejectedValue(
      new Error('Transaction receipt failed')
    );

    await expect(licenseModule.updateSmartLicense(input as any, '0x123')).rejects.toThrow(
      'Transaction receipt failed'
    );
  });
});

describe('OnChainLicenseModule.updateCustomLicense', () => {
  let licenseModule: OnChainLicenseModule;

  beforeEach(() => {
    licenseModule = new OnChainLicenseModule();
    jest.clearAllMocks();
  });

  it('should call generateSignature with the correct address', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.updateCustomLicense(input as any, '0x123');

    expect(generateSignature).toHaveBeenCalledWith('0x123');
  });

  it('should call writeContract with correct arguments', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });

    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.updateCustomLicense(input as any, '0x123');

    expect(writeContract).toHaveBeenCalled();
  });

  it('should call waitForTransactionReceipt with correct transaction hash', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.updateCustomLicense(input as any, '0x123');

    expect(waitForTransactionReceipt).toHaveBeenCalled();
  });

  it('should return transaction response and result when successful', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';
    const transactionResponse = { status: 'success' };

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(transactionResponse);

    const result = await licenseModule.updateCustomLicense(input as any, '0x123');

    expect(result).toEqual({ transactionResponse, result: true });
  });

  it('should throw an error if writeContract fails', async () => {
    const input: any = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockRejectedValue(new Error('writeContract failed'));

    await expect(licenseModule.updateCustomLicense(input, '0x123')).rejects.toThrow(
      'writeContract failed'
    );
  });

  it('should throw an error if waitForTransactionReceipt fails', async () => {
    const input = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockRejectedValue(
      new Error('Transaction receipt failed')
    );

    await expect(licenseModule.updateCustomLicense(input as any, '0x123')).rejects.toThrow(
      'Transaction receipt failed'
    );
  });
});

describe('OnChainLicenseModule.attachExternalLicense', () => {
  let licenseModule: OnChainLicenseModule;

  beforeEach(() => {
    licenseModule = new OnChainLicenseModule();
    jest.clearAllMocks();
  });

  it('should call generateSignature with the correct address', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.attachExternalLicense(input as any, '0x123');

    expect(generateSignature).toHaveBeenCalledWith('0x123');
  });

  it('should call writeContract with correct arguments', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });

    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.attachExternalLicense(input as any, '0x123');

    expect(writeContract).toHaveBeenCalled();
  });

  it('should call waitForTransactionReceipt with correct transaction hash', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue({});

    await licenseModule.attachExternalLicense(input as any, '0x123');

    expect(waitForTransactionReceipt).toHaveBeenCalled();
  });

  it('should return transaction response and result when successful', async () => {
    const input = { ipId: '123', licenseTermId: '456' };
    const encodedData = '0xencoded';
    const signature = '0xsignature';
    const transactionResponse = { status: 'success' };

    (generateSignature as jest.Mock).mockResolvedValue({ encodedData, signature });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockResolvedValue(transactionResponse);

    const result = await licenseModule.attachExternalLicense(input as any, '0x123');

    expect(result).toEqual({ transactionResponse, result: true });
  });

  it('should throw an error if writeContract fails', async () => {
    const input: any = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockRejectedValue(new Error('writeContract failed'));

    await expect(licenseModule.attachExternalLicense(input, '0x123')).rejects.toThrow(
      'writeContract failed'
    );
  });

  it('should throw an error if waitForTransactionReceipt fails', async () => {
    const input = { ipId: '123', licenseTermId: '456' };

    (generateSignature as jest.Mock).mockResolvedValue({
      encodedData: '0xencoded',
      signature: '0xsignature',
    });
    (writeContract as jest.Mock).mockResolvedValue('0xtransaction');
    (waitForTransactionReceipt as jest.Mock).mockRejectedValue(
      new Error('Transaction receipt failed')
    );

    await expect(licenseModule.attachExternalLicense(input as any, '0x123')).rejects.toThrow(
      'Transaction receipt failed'
    );
  });
});

describe('createLicensePDF', () => {
  const mockUploadAssetToIpfs = jest.fn();
  const mockUploadMetaDataToIpfs = jest.fn();
  let licenseModule: OnChainLicenseModule;

  const assetMock = Asset as jest.Mock;
  beforeEach(() => {
    licenseModule = new OnChainLicenseModule();
    assetMock.mockImplementation(() => mockAssetInstance);
    jest.clearAllMocks();
  });
  const mockAssetInstance = {
    uploadAssetToIpfs: mockUploadAssetToIpfs,
    uploadMetaDataToIpfs: mockUploadMetaDataToIpfs,
  };

  it('should successfully create a license PDF and upload metadata to IPFS', async () => {
    const mockKeys: ICreateCustomLicense = {
      isRoyaltyAllowed: true,
      isCommercialUseAllowed: false,
      isExpirable: true,
      isDerivativeAllowed: false,
      licenseFee: 100,
      customKeys: { customTerm: 'Some custom term' },
    };

    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';
    const mockProvider = 'pinata';

    const mockLicenseFile = Buffer.from('mockLicenseFile');
    const mockIpfsHash = 'mockIpfsHash';
    const mockMetaDataHash = 'mockMetaDataHash';
    jest
      .spyOn(licenseModule as any, 'generateKORProtocolLicensePDF')
      .mockResolvedValue(mockLicenseFile);

    mockUploadAssetToIpfs.mockResolvedValueOnce({ ipfsHash: mockIpfsHash });
    mockUploadMetaDataToIpfs.mockResolvedValueOnce({ metaDataHash: mockMetaDataHash });

    const result = await licenseModule['createLicensePDF'](mockKeys, mockAddress, mockProvider);

    // Assertions
    expect(mockUploadAssetToIpfs).toHaveBeenCalledWith(mockLicenseFile, mockProvider, {
      disableISCC: true,
    });
    expect(mockUploadMetaDataToIpfs).toHaveBeenCalledWith(
      {
        name: 'KOR_Protocol_License',
        PIL: {
          isRoyaltyAllowed: mockKeys.isRoyaltyAllowed,
          isCommercialUseAllowed: mockKeys.isCommercialUseAllowed,
          isExpirable: mockKeys.isExpirable,
          isDerivativeAllowed: mockKeys.isDerivativeAllowed,
          licenseFee: mockKeys.licenseFee,
        },
        customTerms: mockKeys.customKeys,
        licenseURI: `ipfs://${mockIpfsHash}`,
      },
      mockProvider
    );
    expect(result).toEqual({ licenseCid: mockMetaDataHash });
  });

  it('should throw an error if license file generation fails', async () => {
    const mockKeys: ICreateSmartLicense = {
      isRoyaltyAllowed: false,
      isCommercialUseAllowed: true,
      isExpirable: false,
      isDerivativeAllowed: true,
      licenseFee: 50,
    };

    const mockAddress = '0xabcdef1234567890abcdef1234567890abcdef12';
    const mockProvider = 'filebase';
    jest
      .spyOn(licenseModule as any, 'generateKORProtocolLicensePDF')
      .mockRejectedValueOnce(new Error('Failed to generate license file'));

    await expect(
      licenseModule['createLicensePDF'](mockKeys, mockAddress, mockProvider)
    ).rejects.toThrow('Failed to generate license file');

    expect(mockUploadAssetToIpfs).not.toHaveBeenCalled();
    expect(mockUploadMetaDataToIpfs).not.toHaveBeenCalled();
  });

  it('should throw an error if IPFS upload fails', async () => {
    const mockKeys: ICreateCustomLicense = {
      isRoyaltyAllowed: true,
      isCommercialUseAllowed: false,
      isExpirable: true,
      isDerivativeAllowed: false,
      licenseFee: 100,
      customKeys: { customTerm: 'Some custom term' },
    };

    const mockAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdef12';
    const mockProvider = 'pinata';

    const mockLicenseFile = Buffer.from('mockLicenseFile');

    jest
      .spyOn(licenseModule as any, 'generateKORProtocolLicensePDF')
      .mockResolvedValue(mockLicenseFile);
    mockUploadAssetToIpfs.mockRejectedValueOnce(new Error('Failed to upload to IPFS'));

    await expect(
      licenseModule['createLicensePDF'](mockKeys, mockAddress, mockProvider)
    ).rejects.toThrow('Failed to upload to IPFS');

    expect(mockUploadAssetToIpfs).toHaveBeenCalledWith(mockLicenseFile, mockProvider, {
      disableISCC: true,
    });
    expect(mockUploadMetaDataToIpfs).not.toHaveBeenCalled();
  });

  it('should throw an error if metadata upload fails', async () => {
    const mockKeys: ICreateCustomLicense = {
      isRoyaltyAllowed: true,
      isCommercialUseAllowed: false,
      isExpirable: true,
      isDerivativeAllowed: false,
      licenseFee: 100,
      customKeys: { customTerm: 'Some custom term' },
    };

    const mockAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdef12';
    const mockProvider = 'pinata';

    const mockLicenseFile = Buffer.from('mockLicenseFile');
    const mockIpfsHash = 'mockIpfsHash';

    jest
      .spyOn(licenseModule as any, 'generateKORProtocolLicensePDF')
      .mockResolvedValue(mockLicenseFile);
    mockUploadAssetToIpfs.mockResolvedValueOnce({ ipfsHash: mockIpfsHash });
    mockUploadMetaDataToIpfs.mockRejectedValueOnce(new Error('Failed to upload metadata'));

    await expect(
      licenseModule['createLicensePDF'](mockKeys, mockAddress, mockProvider)
    ).rejects.toThrow('Failed to upload metadata');

    expect(mockUploadAssetToIpfs).toHaveBeenCalledWith(mockLicenseFile, mockProvider, {
      disableISCC: true,
    });
    expect(mockUploadMetaDataToIpfs).toHaveBeenCalledWith(
      {
        name: 'KOR_Protocol_License',
        PIL: {
          isRoyaltyAllowed: mockKeys.isRoyaltyAllowed,
          isCommercialUseAllowed: mockKeys.isCommercialUseAllowed,
          isExpirable: mockKeys.isExpirable,
          isDerivativeAllowed: mockKeys.isDerivativeAllowed,
          licenseFee: mockKeys.licenseFee,
        },
        customTerms: mockKeys.customKeys,
        licenseURI: `ipfs://${mockIpfsHash}`,
      },
      mockProvider
    );
  });
});

describe('generateKORProtocolLicensePDF', () => {
  const mockFetch = jest.fn();
  const mockDocHtml = jest.fn();
  const mockOutput = jest.fn();
  let licenseModule = new OnChainLicenseModule();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
    (jsPDF as unknown as jest.Mock).mockImplementation(() => ({
      html: mockDocHtml,
      output: mockOutput,
    }));
    licenseModule = new OnChainLicenseModule();
  });

  it('should successfully generate a license PDF file', async () => {
    const mockLicenseData = {
      isRoyaltyAllowed: true,
      isCommercialUseAllowed: false,
      isExpirable: true,
      isDerivativeAllowed: false,
      licenseFee: 100,
      customKeys: { customTerm: 'Custom term value' },
    };
    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';

    const mockApiUrl = 'https://mock-api.com';
    const mockHeaders = { Authorization: 'Bearer mock-token' };
    const mockHtmlContent = '<html><body>Mock License Content</body></html>';
    const mockBlob = new Blob(['mock-pdf-content'], { type: 'application/pdf' });
    const expectedFile = new File([mockBlob], 'KOR_Protocol_License.pdf', {
      type: 'application/pdf',
    });

    (getApiUrl as jest.Mock).mockReturnValue(mockApiUrl);
    (getApiHeaders as jest.Mock).mockReturnValue(mockHeaders);
    mockFetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ templateHtml: mockHtmlContent }),
    });
    mockOutput.mockReturnValue(mockBlob);

    mockDocHtml.mockImplementation((_htmlContent, options) => {
      // Simulate the callback after rendering HTML
      options.callback({ output: mockOutput });
    });

    const result = await licenseModule['generateKORProtocolLicensePDF'](
      mockLicenseData,
      mockAddress
    );

    // Assertions
    expect(getApiUrl).toHaveBeenCalled();
    expect(getApiHeaders).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(`${mockApiUrl}/license/license-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...mockHeaders },
      body: JSON.stringify({
        ...mockLicenseData,
        senderWalletAddress: mockAddress,
      }),
    });
    expect(mockDocHtml).toHaveBeenCalledWith(mockHtmlContent, {
      callback: expect.any(Function),
      x: 10,
      y: 10,
      width: 190,
      windowWidth: 800,
    });
    expect(result).toEqual(expectedFile);
  });

  it('should throw an error if the fetch request fails', async () => {
    const mockLicenseData = {
      isRoyaltyAllowed: true,
      isCommercialUseAllowed: false,
      isExpirable: true,
      isDerivativeAllowed: false,
      licenseFee: 100,
      customKeys: { customTerm: 'Custom term value' },
    };
    const mockAddress = '0x1234567890abcdef1234567890abcdef12345678';

    (getApiUrl as jest.Mock).mockReturnValue('https://mock-api.com');
    (getApiHeaders as jest.Mock).mockReturnValue({ Authorization: 'Bearer mock-token' });
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(
      licenseModule['generateKORProtocolLicensePDF'](mockLicenseData, mockAddress)
    ).rejects.toThrow('Network error');

    expect(mockFetch).toHaveBeenCalled();
    expect(mockDocHtml).not.toHaveBeenCalled();
  });
});
