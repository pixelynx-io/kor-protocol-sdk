/* eslint-disable @typescript-eslint/no-explicit-any */
import { IAssetUploadResponse, IMetaDataType } from '../../types';
import { Base } from '../base';

// Mock the global FileList type
class MockFileList {
  [index: number]: File;
  length: number;
  item(index: number): File | null {
    return this[index] || null;
  }
  constructor(files: File[]) {
    files.forEach((file, index) => {
      this[index] = file;
    });
    this.length = files.length;
  }
}

global.FileList = MockFileList as never;

jest.mock('@wagmi/core', () => ({
  createConfig: jest.fn(),
}));

jest.mock('@wagmi/core/chains', () => ({
  baseSepolia: { id: 'baseSepolia', network: 'sepolia' },
  base: { id: 'base', network: 'base' },
}));

jest.mock('../../utils', () => ({
  getApiUrl: jest.fn().mockReturnValue('http://mock-api-url'),
  setOrigin: jest.fn(),
  getContractAddresses: jest
    .fn()
    .mockResolvedValue({ IP_CONTRACT_ADDRESS: '0x', NFT_CONTRACT_ADDRESS: '0x' }),
}));

jest.mock('../nft-module');
jest.mock('../ip-module');

describe('Asset Class', () => {
  let asset: Base;
  let mockFiles: Partial<FileList>;
  let mockFiles2: Partial<FileList>;

  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    asset = new Base();
    global.fetch = jest.fn();
    // Create a mock FileList object
    const file1 = new File(['content of file 1'], 'file1.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    const file2 = new File(['content of file 2'], 'file2.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    mockFiles = new MockFileList([file1, file2]);
    mockFiles2 = new MockFileList([file1]);
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorMock.mockRestore();
  });

  describe('uploadAssetToIpfs', () => {
    it('should upload a single file to IPFS and return the response', async () => {
      const mockFile = new File(['file-content'], 'test.txt', { type: 'text/plain' });
      const mockResponse: IAssetUploadResponse = { ipfsHash: 'mockIpfsHash' };

      jest.spyOn(asset as any, 'uploadFileToProvider').mockResolvedValue(mockResponse);
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      const result = await asset.uploadAssetToIpfs(mockFile, 'pinata');

      expect(result).toEqual(mockResponse);
      expect(asset['uploadFileToProvider']).toHaveBeenCalledWith('pinata', mockFile, undefined);
    });

    it('should upload a single file to IPFS and return the response, default pinata', async () => {
      const mockFile = new File(['file-content'], 'test.txt', { type: 'text/plain' });
      const mockResponse: IAssetUploadResponse = { ipfsHash: 'mockIpfsHash' };

      jest.spyOn(asset as any, 'uploadFileToProvider').mockResolvedValue(mockResponse);
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      const result = await asset.uploadAssetToIpfs(mockFile);

      expect(result).toEqual(mockResponse);
      expect(asset['uploadFileToProvider']).toHaveBeenCalledWith('pinata', mockFile, undefined);
    });

    it('should upload a single file to IPFS filebase and return the response', async () => {
      const mockFile = new File(['file-content'], 'test.txt', { type: 'text/plain' });
      const mockResponse: IAssetUploadResponse = { ipfsHash: 'mockIpfsHash' };

      jest.spyOn(asset as any, 'uploadFileToProvider').mockResolvedValue(mockResponse);
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      const result = await asset.uploadAssetToIpfs(mockFile, 'filebase');

      expect(result).toEqual(mockResponse);
      expect(asset['uploadFileToProvider']).toHaveBeenCalledWith('filebase', mockFile, undefined);
    });

    it('should upload multiple files as FileList to IPFS', async () => {
      const mockResponse: IAssetUploadResponse = { ipfsHash: 'mockIpfsFolderHash' };

      jest.spyOn(asset as any, 'uploadFolderToProvider').mockResolvedValue(mockResponse);

      const result = await asset.uploadAssetToIpfs(mockFiles as FileList, 'filebase');

      expect(result).toEqual(mockResponse);
      expect(asset['uploadFolderToProvider']).toHaveBeenCalledWith(
        mockFiles,
        'filebase',
        undefined
      );
    });

    it('should throw an error if no file is provided', async () => {
      await expect(asset.uploadAssetToIpfs(null as any, 'pinata')).rejects.toThrow(
        'File param is mandatory to call uploadAssetToIpfs'
      );
    });
  });

  describe('uploadMetaDataToIpfs', () => {
    const mockMetaData: IMetaDataType = { key: 'value' };

    it('should upload single metadata to Pinata and return metadata hash', async () => {
      const mockHash = 'mockMetaDataHash';
      jest.spyOn(asset as any, 'uploadMetaDataToPinataIpfs').mockResolvedValue(mockHash);

      const result = await asset.uploadMetaDataToIpfs(mockMetaData, 'pinata');

      expect(result.metaDataHash).toBe(mockHash);
      expect(asset['uploadMetaDataToPinataIpfs']).toHaveBeenCalledWith(mockMetaData);
    });

    it('should upload multiple metadata to Pinata and return metadata hash', async () => {
      const mockMetaDataArray: IMetaDataType[] = [{ key: 'value1' }, { key: 'value2' }];
      const mockHash = 'mockFilebaseMetaHash';
      jest.spyOn(asset as any, 'uploadFolderMetaDataToPinataIpfs').mockResolvedValue(mockHash);

      const result = await asset.uploadMetaDataToIpfs(mockMetaDataArray, 'pinata');

      expect(result.metaDataHash).toBe(mockHash);
      expect(asset['uploadFolderMetaDataToPinataIpfs']).toHaveBeenCalledWith(mockMetaDataArray);
    });

    it('should upload single metadata to Filebase and return metadata hash', async () => {
      const mockHash = 'mockMetaDataHash';
      jest.spyOn(asset as any, 'uploadMetaDataToFilebaseIpfs').mockResolvedValue(mockHash);

      const result = await asset.uploadMetaDataToIpfs(mockMetaData, 'filebase');

      expect(result.metaDataHash).toBe(mockHash);
      expect(asset['uploadMetaDataToFilebaseIpfs']).toHaveBeenCalledWith(mockMetaData, undefined);
    });

    it('should upload multiple metadata to Filebase and return metadata hash', async () => {
      const mockMetaDataArray: IMetaDataType[] = [{ key: 'value1' }, { key: 'value2' }];
      const mockHash = 'mockFilebaseMetaHash';
      jest.spyOn(asset as any, 'uploadFolderMetaDataToFilebaseIpfs').mockResolvedValue(mockHash);

      const result = await asset.uploadMetaDataToIpfs(mockMetaDataArray, 'filebase');

      expect(result.metaDataHash).toBe(mockHash);
      expect(asset['uploadFolderMetaDataToFilebaseIpfs']).toHaveBeenCalledWith(
        mockMetaDataArray,
        undefined
      );
    });
  });

  describe('uploadAssetToURL', () => {
    const mockFile = new File(['file-content'], 'test.txt', { type: 'text/plain' });
    const mockUrl = 'https://example.com/upload';

    it('should upload a file to a given URL and return the uploaded URL', async () => {
      const mockUploadedUrl = `${new URL(mockUrl).origin}${new URL(mockUrl).pathname}`;
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
      });

      const result = await asset.uploadAssetToURL(mockFile, mockUrl);

      expect(result).toBe(mockUploadedUrl);
    });

    it('should throw an error if upload fails', async () => {
      const mockError = new Error('Upload failed');
      global.fetch = jest.fn().mockRejectedValue(mockError);
      await expect(asset.uploadAssetToURL(mockFile, mockUrl)).rejects.toThrow('Upload failed');
    });

    it('should throw an error if upload fails', async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValue({ json: () => Promise.resolve({ message: 'limit reached' }) });
      await expect(asset.uploadAssetToURL(mockFile, mockUrl)).rejects.toThrow(
        'Some error occured while uploading file'
      );
    });
  });

  describe('createBucket', () => {
    const bucketName = 'test-bucket';
    const mockFolderId = 'mockFolderId';

    it('should create a new bucket and return folderId', async () => {
      const mockResponse = { folderId: mockFolderId };
      (fetch as jest.Mock).mockResolvedValueOnce(new Response(JSON.stringify(mockResponse)));

      const result = await asset.createBucket(bucketName);

      expect(result.folderId).toBe(mockFolderId);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/asset/filebase/create-bucket'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ bucketName }),
        })
      );
    });

    it('should throw an error if bucket name is missing', async () => {
      await expect(asset.createBucket('')).rejects.toThrow(
        'Bucket name should be provided to create a new bucket'
      );
    });
    it('should throw an error if api fails to create bucket', async () => {
      (fetch as jest.Mock).mockRejectedValue({ message: 'Missing bucket name' });
      await expect(asset.createBucket('abc')).rejects.toThrow('Missing bucket name');
    });
    it('should throw a custom error if api fails to create bucket', async () => {
      (fetch as jest.Mock).mockRejectedValue({});
      await expect(asset.createBucket('abc')).rejects.toThrow('Error while creating folder');
    });
  });

  describe('pinFolderToFilebaseIpfs', () => {
    const bucketName = 'test-bucket';
    const mockIpfsHash = 'mockIpfsHash';

    it('should pin folder to Filebase IPFS and return IPFS hash', async () => {
      const mockResponse = { cid: mockIpfsHash };
      (fetch as jest.Mock).mockResolvedValueOnce(new Response(JSON.stringify(mockResponse)));

      const result = await asset.pinFolderToFilebaseIpfs(bucketName);

      expect(result.ipfsHash).toBe(mockIpfsHash);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/asset/filebase/generate-bucket-cid'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ bucketName }),
        })
      );
    });

    it('should throw error correctly', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce({ message: 'Network error' });

      await expect(asset.pinFolderToFilebaseIpfs(bucketName)).rejects.toThrow('Network error');
    });

    it('should throw error correctly', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(undefined);

      await expect(asset.pinFolderToFilebaseIpfs(bucketName)).rejects.toThrow(
        'Error while creating folder'
      );
    });

    it('should throw an error if bucket name is missing', async () => {
      await expect(asset.pinFolderToFilebaseIpfs('')).rejects.toThrow(
        'Bucket name should be provided to pin folder to ipfs'
      );
    });
  });
  describe('uploadAssetToFilebase', () => {
    it('should upload an asset and return the IPFS hash', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ signedUrl: 'http://signed-url' }),
          })
        )
        .mockResolvedValueOnce({ headers: new Headers({ 'X-Amz-Meta-Cid': 'ipfsHash123' }) });

      const ipfsHash = await asset['uploadAssetToFilebase'](file, options);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(ipfsHash).toBe('ipfsHash123');
    });

    it('return empty string if header is empty', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ signedUrl: 'http://signed-url' }),
          })
        )
        .mockResolvedValueOnce({});

      const ipfsHash = await asset['uploadAssetToFilebase'](file, options);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(ipfsHash).toBe('');
    });

    it('return empty string if header is empty', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ signedUrl: 'http://signed-url' }),
          })
        )
        .mockResolvedValueOnce(undefined);

      const ipfsHash = await asset['uploadAssetToFilebase'](file, options);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(ipfsHash).toBe('');
    });

    it('should handle errors correctly', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ signedUrl: 'http://signed-url' }),
          })
        )
        .mockResolvedValueOnce(undefined);

      await expect(asset['uploadAssetToFilebase'](file)).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest
        .fn()
        .mockImplementationOnce(() =>
          Promise.resolve({
            ok: false,
            json: () => Promise.resolve({ message: 'test' }),
          })
        )
        .mockResolvedValueOnce(undefined);

      await expect(asset['uploadAssetToFilebase'](file)).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest.fn().mockRejectedValue({ message: 'Bad Request' });

      await expect(asset['uploadAssetToFilebase'](file)).rejects.toThrow('Bad Request');
    });

    it('should handle errors correctly', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest.fn().mockRejectedValue({});

      await expect(asset['uploadAssetToFilebase'](file)).rejects.toThrow(
        'Error while uploading file'
      );
    });

    it('should handle errors correctly', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest.fn().mockRejectedValue(undefined);

      await expect(asset['uploadAssetToFilebase'](file)).rejects.toThrow(
        'Error while uploading file'
      );
    });
  });
  describe('uploadAssetFolderToFilebaseIpfs', () => {
    it('should upload multiple assets and return their IPFS hashes', async () => {
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ signedUrl: 'http://signed-url' }),
        })
        .mockResolvedValueOnce({ headers: new Headers({ 'x-amz-meta-cid': 'ipfsHash123' }) });

      const ipfsHashes = await asset['uploadAssetFolderToFilebaseIpfs'](
        mockFiles2 as FileList,
        options
      );

      expect(fetch).toHaveBeenCalledTimes(mockFiles2.length! + 1); // +1 for the first fetch
      expect(ipfsHashes).toEqual(expect.arrayContaining(['ipfsHash123']));
    });

    it('should handle errors correctly', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        message: 'Something went wrong',
        json: () => Promise.resolve({}),
      });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      await expect(
        asset['uploadAssetFolderToFilebaseIpfs'](mockFiles2 as FileList)
      ).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        message: 'Something went wrong',
        json: () => Promise.resolve({ message: 'Something went wrong' }),
      });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      await expect(
        asset['uploadAssetFolderToFilebaseIpfs'](mockFiles2 as FileList)
      ).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      global.fetch = jest.fn().mockRejectedValue({});
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      await expect(
        asset['uploadAssetFolderToFilebaseIpfs'](mockFiles2 as FileList)
      ).rejects.toThrow('Error while uploading file');
    });
    it('should handle errors correctly', async () => {
      global.fetch = jest.fn().mockRejectedValue(undefined);
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      await expect(
        asset['uploadAssetFolderToFilebaseIpfs'](mockFiles2 as FileList)
      ).rejects.toThrow('Error while uploading file');
    });
  });
  describe('carCompressor', () => {
    it('should create a car file from the input files', async () => {
      const files = [new File(['content'], 'test1.txt'), new File(['content'], 'test2.txt')];

      const car = await asset['carCompressor'](files);

      expect(car).toBeDefined(); // You can add more specific checks based on the car format
    });
  });

  describe('uploadFileToProvider', () => {
    it('should upload file to pinata', async () => {
      const file = new File(['content'], 'test.txt');
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      jest.spyOn(asset as any, 'uploadAssetToPinata').mockResolvedValue('ipfsHashPinata');

      const result = await asset['uploadFileToProvider']('pinata', file);

      expect(result).toEqual({ ipfsHash: 'ipfsHashPinata' });
    });

    it('should upload file to filebase', async () => {
      const file = new File(['content'], 'test.txt');
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      jest.spyOn(asset as any, 'uploadAssetToFilebase').mockResolvedValue('ipfsHashFilebase');

      const result = await asset['uploadFileToProvider']('filebase', file);

      expect(result).toEqual({ ipfsHash: 'ipfsHashFilebase' });
    });
  });
  describe('uploadFolderToProvider', () => {
    it('should upload folder to pinata and generate ISCC', async () => {
      jest.spyOn(asset as any, 'uploadAssetFolderToPinataIpfs').mockResolvedValue('ipfsHashPinata');
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      const result = await asset['uploadFolderToProvider'](mockFiles2 as FileList, 'pinata');

      expect(result).toEqual({ ipfsHash: 'ipfsHashPinata' });
    });

    it('should upload folder to pinata and generate ISCC to default pinata', async () => {
      jest.spyOn(asset as any, 'uploadAssetFolderToPinataIpfs').mockResolvedValue('ipfsHashPinata');
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      const result = await asset['uploadFolderToProvider'](mockFiles2 as FileList);

      expect(result).toEqual({ ipfsHash: 'ipfsHashPinata' });
    });

    it('should upload folder to filebase and generate ISCC', async () => {
      jest
        .spyOn(asset as any, 'uploadAssetFolderToFilebaseIpfs')
        .mockResolvedValue('ipfsHashFilebase');
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      const result = await asset['uploadFolderToProvider'](mockFiles2 as FileList, 'filebase');

      expect(result).toEqual({ ipfsHash: 'ipfsHashFilebase' });
    });
  });
  describe('uploadFolderMetaDataToPinataIpfs', () => {
    it('should upload folder metadata and return the IPFS hash', async () => {
      const metaData = [{ key: 'value' }];

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ jwt: 'token', ok: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ IpfsHash: 'ipfsHash', ok: true }),
        });

      const ipfsHash = await asset['uploadFolderMetaDataToPinataIpfs'](metaData);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(ipfsHash).toBe('ipfsHash');
    });

    it('should handle errors correctly', async () => {
      const metaData = [{ key: 'value' }];

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ message: 'token' }) })
        .mockRejectedValueOnce({ message: 'Something went wrong' });

      await expect(asset['uploadFolderMetaDataToPinataIpfs'](metaData)).rejects.toThrow(
        'token: unable to generate jwt'
      );
    });
    it('should handle errors correctly', async () => {
      const metaData = [{ key: 'value' }];

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ json: () => Promise.resolve({}) })
        .mockRejectedValueOnce({});

      await expect(asset['uploadFolderMetaDataToPinataIpfs'](metaData)).rejects.toThrow();
    });
    it('should handle errors correctly', async () => {
      const metaData = [{ key: 'value' }];

      global.fetch = jest.fn().mockRejectedValueOnce(undefined);

      await expect(asset['uploadFolderMetaDataToPinataIpfs'](metaData)).rejects.toThrow(
        'Something went wrong'
      );
    });
  });

  describe('uploadFolderMetaDataToFilebaseIpfs', () => {
    it('should upload folder metadata and return the IPFS hash', async () => {
      const metaData = [{ key: 'value' }];
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ signedUrl: 'http://signed-url' }),
        })
        .mockResolvedValueOnce({ headers: new Headers({ 'x-amz-meta-cid': 'ipfsHash' }) });

      const ipfsHash = await asset['uploadFolderMetaDataToFilebaseIpfs'](metaData, options);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(ipfsHash).toBe('ipfsHash');
    });

    it('should upload folder metadata and return the IPFS hash', async () => {
      const metaData = [{ key: 'value' }];

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ signedUrl: 'http://signed-url' }),
        })
        .mockResolvedValueOnce({
          headers: new Headers({ 'x-amz-meta-cid': 'ipfsHash' }),
          ok: true,
        });

      const ipfsHash = await asset['uploadFolderMetaDataToFilebaseIpfs'](metaData);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(ipfsHash).toBe('ipfsHash');
    });

    it('should upload folder metadata and return empty IPFS hash', async () => {
      const metaData = [{ key: 'value' }];

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ signedUrl: 'http://signed-url' }),
        })
        .mockResolvedValueOnce({});

      const ipfsHash = await asset['uploadFolderMetaDataToFilebaseIpfs'](metaData);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(ipfsHash).toBe('');
    });

    it('should handle errors correctly', async () => {
      const metaData = [{ key: 'value' }];
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'unable to generate presigned url' }),
        message: 'unable to generate presigned url',
      });

      await expect(
        asset['uploadFolderMetaDataToFilebaseIpfs'](metaData, options)
      ).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      const metaData = [{ key: 'value' }];
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };

      global.fetch = jest.fn().mockRejectedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'unable to generate presigned url' }),
        message: 'unable to generate presigned url',
      });

      await expect(asset['uploadFolderMetaDataToFilebaseIpfs'](metaData, options)).rejects.toThrow(
        'unable to generate presigned url'
      );
    });

    it('should handle errors correctly', async () => {
      const metaData = [{ key: 'value' }];
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };

      global.fetch = jest.fn().mockRejectedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'unable to generate presigned url' }),
        statusText: 'unable to generate presigned url',
      });

      await expect(asset['uploadFolderMetaDataToFilebaseIpfs'](metaData, options)).rejects.toThrow(
        'Something went wrong'
      );
    });

    it('should handle errors correctly', async () => {
      const metaData = [{ key: 'value' }];
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };

      global.fetch = jest.fn().mockRejectedValueOnce(undefined);

      await expect(asset['uploadFolderMetaDataToFilebaseIpfs'](metaData, options)).rejects.toThrow(
        'Something went wrong'
      );
    });
  });
  describe('uploadMetaDataToPinataIpfs', () => {
    it('should upload metadata and return the IPFS hash', async () => {
      const metaData = { key: 'value' };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ jwt: 'token' }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ IpfsHash: 'ipfsHash' }) });

      const ipfsHash = await asset['uploadMetaDataToPinataIpfs'](metaData);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(ipfsHash).toBe('ipfsHash');
    });

    it('should handle errors correctly', async () => {
      const metaData = { key: 'value' };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ jwt: 'token' }) })

        .mockRejectedValueOnce({ message: 'Network error' });

      await expect(asset['uploadMetaDataToPinataIpfs'](metaData)).rejects.toThrow('Network error');
    });

    it('should handle errors correctly', async () => {
      const metaData = { key: 'value' };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ jwt: 'token' }) })

        .mockRejectedValueOnce(undefined);

      await expect(asset['uploadMetaDataToPinataIpfs'](metaData)).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      const metaData = { key: 'value' };

      global.fetch = jest
        .fn()
        .mockRejectedValueOnce({ ok: false, json: () => Promise.resolve({ jwt: 'token' }) })
        .mockRejectedValueOnce(undefined);

      await expect(asset['uploadMetaDataToPinataIpfs'](metaData)).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      const metaData = { key: 'value' };

      global.fetch = jest.fn().mockRejectedValueOnce(undefined).mockRejectedValueOnce(undefined);

      await expect(asset['uploadMetaDataToPinataIpfs'](metaData)).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      const metaData = undefined;

      await expect(asset['uploadMetaDataToPinataIpfs'](metaData as any)).rejects.toThrow(
        'Meta data can not be undefined'
      );
    });
  });

  describe('uploadMetaDataToFilebaseIpfs', () => {
    it('should upload metadata and return the IPFS hash', async () => {
      const metaData = { key: 'value' };
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ signedUrl: 'http://signed-url' }),
        })
        .mockResolvedValueOnce({ headers: new Headers({ 'x-amz-meta-cid': 'ipfsHash' }) });

      const ipfsHash = await asset['uploadMetaDataToFilebaseIpfs'](metaData, options);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(ipfsHash).toBe('ipfsHash');
    });

    it('should handle errors correctly', async () => {
      const metaData = { key: 'value' };
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'unable to generate presigned url' }),
      });

      await expect(asset['uploadMetaDataToFilebaseIpfs'](metaData, options)).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      const metaData = undefined;
      const options = { bucketName: 'test-bucket', folderName: 'test-folder' };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({}) });

      await expect(
        asset['uploadMetaDataToFilebaseIpfs'](metaData as any, options)
      ).rejects.toThrow();
    });
    it('should handle errors correctly', async () => {
      const metaData = { key: 'value' };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ message: 'test' }) });

      await expect(asset['uploadMetaDataToFilebaseIpfs'](metaData)).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      const metaData = { key: 'value' };

      global.fetch = jest.fn().mockRejectedValueOnce({});

      await expect(asset['uploadMetaDataToFilebaseIpfs'](metaData)).rejects.toThrow(
        'Something went wrong'
      );
    });
  });

  describe('uploadAssetToPinata', () => {
    it('should upload the asset and return the IPFS hash', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      // Mocking the fetch calls
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ jwt: 'mocked-jwt' }),
        })

        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ IpfsHash: 'mocked-ipfs-hash' }),
        });

      const ipfsHash = await asset['uploadAssetToPinata'](mockFile);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/asset/pinata/generate-jwt'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.pinata.cloud/pinning/pinFileToIPFS'),
        expect.any(Object)
      );
      expect(ipfsHash).toBe('mocked-ipfs-hash');
    });

    it('should handle errors correctly', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      // Mocking the fetch call to throw an error
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ jwt: 'mocked-jwt' }) })

        .mockRejectedValueOnce({ message: 'Network error' });

      await expect(asset['uploadAssetToPinata'](mockFile)).rejects.toThrow('Network error');
    });

    it('should handle errors correctly', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      // Mocking the fetch call to throw an error
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ jwt: 'mocked-jwt' }) })

        .mockRejectedValueOnce(undefined);

      await expect(asset['uploadAssetToPinata'](mockFile)).rejects.toThrow('Unable to upload file');
    });

    it('should handle errors correctly', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      // Mocking the fetch call to throw an error
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ jwt: 'mocked-jwt' }) })

        .mockRejectedValueOnce(undefined);

      await expect(asset['uploadAssetToPinata'](mockFile)).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      // Mocking the fetch call to throw an error
      global.fetch = jest.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(undefined);

      await expect(asset['uploadAssetToPinata'](mockFile)).rejects.toThrow();
    });
  });

  describe('uploadAssetFolderToPinataIpfs', () => {
    it('should upload multiple files from a folder and return the IPFS hash', async () => {
      // Mocking the fetch calls
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ jwt: 'mocked-jwt' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ IpfsHash: 'mocked-ipfs-hash' }),
        });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      const ipfsHash = await asset['uploadAssetFolderToPinataIpfs'](mockFiles as FileList);

      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/asset/pinata/generate-jwt'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.pinata.cloud/pinning/pinFileToIPFS'),
        expect.any(Object)
      );
      expect(ipfsHash).toBe('mocked-ipfs-hash');
    });

    it('should upload multiple files from a folder and return the IPFS hash with directory wrap', async () => {
      // Mocking the fetch calls
      const file1 = new File(['content of file 1'], 'file1.txt', {
        type: 'text/plain',
        lastModified: Date.now(),
      });

      const file2 = new File(['content of file 2'], 'file2.txt', {
        type: 'text/plain',
        lastModified: Date.now(),
      });
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      // Define webkitRelativePath as a read-only property on the mock files
      Object.defineProperty(file1, 'webkitRelativePath', {
        value: 'folder1/file1.txt',
        writable: false,
      });
      Object.defineProperty(file2, 'webkitRelativePath', {
        value: 'folder1/file2.txt',
        writable: false,
      });

      const mockFiles3 = new MockFileList([file1, file2]);

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ jwt: 'mocked-jwt' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ IpfsHash: 'mocked-ipfs-hash' }),
        });

      const ipfsHash = await asset['uploadAssetFolderToPinataIpfs'](mockFiles3 as FileList);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/asset/pinata/generate-jwt'),
        expect.any(Object)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.pinata.cloud/pinning/pinFileToIPFS'),
        expect.any(Object)
      );
      expect(ipfsHash).toBe('mocked-ipfs-hash');
    });

    it('should handle errors correctly', async () => {
      // Mocking the fetch call to throw an error
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ jwt: 'mocked-jwt' }) })
        .mockRejectedValueOnce({ message: 'Network error' });

      await expect(asset['uploadAssetFolderToPinataIpfs'](mockFiles2 as FileList)).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle errors correctly', async () => {
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      // Mocking the fetch call to throw an error
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve({ jwt: 'mocked-jwt' }) })
        .mockRejectedValueOnce({ message: 'Network error' });

      await expect(
        asset['uploadAssetFolderToPinataIpfs'](mockFiles2 as FileList)
      ).rejects.toThrow();
    });

    it('should handle errors correctly', async () => {
      jest.spyOn(asset as any, 'generateISCC').mockImplementation(() => {});

      // Mocking the fetch call to throw an error
      global.fetch = jest.fn().mockRejectedValueOnce(undefined);

      await expect(asset['uploadAssetFolderToPinataIpfs'](mockFiles2 as FileList)).rejects.toThrow(
        'Unable to upload file'
      );
    });
  });
  describe('generateISCC', () => {
    it('should successfully generate ISCC for given files', async () => {
      const data = [
        { assetUrl: 'http://example.com/file1', fileName: 'file1.txt', size: 12345, providerId: 1 },
      ];

      // Mocking the fetch call
      global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });

      await asset['generateISCC'](data);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/iscc/generate-iscc'),
        expect.any(Object)
      );
    });

    it('should log a warning if generating ISCC fails', async () => {
      const data = [
        { assetUrl: 'http://example.com/file1', fileName: 'file1.txt', size: 12345, providerId: 1 },
      ];

      // Mocking the fetch call to fail
      global.fetch = jest.fn().mockImplementationOnce(() => Promise.resolve({ ok: false }));

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await asset['generateISCC'](data);

      expect(consoleWarnSpy).toHaveBeenCalledWith('Unable to generate iscc for the code');
      consoleWarnSpy.mockRestore();
    });

    it('should log an error if an exception occurs', async () => {
      const data = [
        { assetUrl: 'http://example.com/file1', fileName: 'file1.txt', size: 12345, providerId: 1 },
      ];

      // Mocking the fetch call to throw an error
      global.fetch = jest.fn().mockRejectedValueOnce({ message: 'Network error' });

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await asset['generateISCC'](data);

      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });
  });
});
