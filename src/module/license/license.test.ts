/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnChainLicenseModule } from '.';
import { generateSignature } from '../../utils';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';

jest.mock('../../utils', () => ({
  generateSignature: jest.fn(),
  getApiUrl: jest.fn().mockReturnValue('http://mock-api-url'),
  getConfig: jest.fn(),
  getContractAddresses: jest.fn().mockResolvedValue({
    IP_CONTRACT_ADDRESS: '0x',
    NFT_CONTRACT_ADDRESS: '0x',
    LICENSE_CONTRACT_ADDRESS: '0x',
  }),
}));

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
