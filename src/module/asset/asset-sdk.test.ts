import { Asset } from './asset';

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

describe('AssetClass - uploadAssetToIpfs', () => {
  let assetClass: Asset;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    assetClass = new Asset();

    // Mock the internal methods
    assetClass['uploadAsset'] = jest.fn().mockResolvedValue('mocked_ipfs_hash');
    assetClass['uploadMetaDataToIpfs'] = jest.fn().mockResolvedValue('mocked_meta_data_hash');
    assetClass['uploadAssetFolder'] = jest.fn().mockResolvedValue('mocked_folder_ipfs_hash');
    assetClass['uploadFolderMetaData'] = jest
      .fn()
      .mockResolvedValue('mocked_folder_meta_data_hash');
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    consoleErrorMock.mockRestore();
  });

  const file1 = new File(['content of file 1'], 'file1.txt', {
    type: 'text/plain',
    lastModified: Date.now(),
  });

  const file2 = new File(['content of file 2'], 'file2.txt', {
    type: 'text/plain',
    lastModified: Date.now(),
  });

  const mockFiles = new MockFileList([file1, file2]);

  it('should upload a single file and metadata, and return their IPFS hashes', async () => {
    const mockFile = new File(['content'], 'testfile.txt', { type: 'text/plain' });
    const mockMetaData = { name: 'Test Asset', description: 'Test Description' };

    const result = await assetClass.uploadAssetToIpfs(mockFile, mockMetaData);

    expect(assetClass['uploadAsset']).toHaveBeenCalledWith(mockFile);
    expect(assetClass['uploadMetaDataToIpfs']).toHaveBeenCalledWith(
      mockMetaData,
      'mocked_ipfs_hash'
    );
    expect(result).toEqual({ ipfsHash: 'mocked_ipfs_hash', metaDataHash: 'mocked_meta_data_hash' });
  });

  it('should upload a single file without metadata and return its IPFS hash', async () => {
    const mockFile = new File(['content'], 'testfile.txt', { type: 'text/plain' });
    assetClass['uploadMetaDataToIpfs'] = jest.fn().mockResolvedValue(undefined);

    const result = await assetClass.uploadAssetToIpfs(mockFile);

    expect(assetClass['uploadAsset']).toHaveBeenCalledWith(mockFile);
    expect(result).toEqual({ ipfsHash: 'mocked_ipfs_hash', metaDataHash: undefined });
  });

  it('should upload multiple files and metadata, and return their IPFS hashes', async () => {
    const mockMetaData = [
      { name: 'Test Asset 1', description: 'Test Description 1' },
      { name: 'Test Asset 2', description: 'Test Description 2' },
    ];

    const result = await assetClass.uploadAssetToIpfs(mockFiles as FileList, mockMetaData);

    expect(assetClass['uploadAssetFolder']).toHaveBeenCalledWith(mockFiles);
    expect(assetClass['uploadFolderMetaData']).toHaveBeenCalledWith(
      mockMetaData,
      'mocked_folder_ipfs_hash'
    );
    expect(result).toEqual({
      ipfsHash: 'mocked_folder_ipfs_hash',
      metaDataHash: 'mocked_folder_meta_data_hash',
    });
  });

  it('should upload multiple files without metadata and return their IPFS hash', async () => {
    const result = await assetClass.uploadAssetToIpfs(mockFiles as FileList);

    expect(assetClass['uploadAssetFolder']).toHaveBeenCalledWith(mockFiles);
    expect(assetClass['uploadFolderMetaData']).not.toHaveBeenCalled();
    expect(result).toEqual({ ipfsHash: 'mocked_folder_ipfs_hash', metaDataHash: undefined });
  });

  it('should handle errors gracefully and return undefined hashes', async () => {
    assetClass['uploadAsset'] = jest.fn().mockRejectedValue(new Error('Upload failed'));

    const mockFile = new File(['content'], 'testfile.txt', { type: 'text/plain' });
    const result = await assetClass.uploadAssetToIpfs(mockFile);

    expect(assetClass['uploadAsset']).toHaveBeenCalledWith(mockFile);
    expect(result).toEqual({ ipfsHash: '', metaDataHash: undefined });
  });
});
