import { Asset } from './asset';

class MockFileList {
  private files: File[];

  constructor(files: File[]) {
    this.files = files;
  }

  get length(): number {
    return this.files.length;
  }

  item(index: number): File | null {
    return this.files[index] || null;
  }

  // Allow indexing to access files like a FileList
  [index: number]: File;

  [Symbol.iterator]() {
    let index = 0;
    const files = this.files;

    return {
      next: () => {
        if (index < files.length) {
          return { done: false, value: files[index++] };
        } else {
          return { done: true, value: null };
        }
      },
    };
  }
}

// Setting global.FileList to our mock
global.FileList = MockFileList as unknown as typeof FileList;

describe('AssetClass', () => {
  let assetClass: Asset;
  let mockFile: File;
  let mockMetaData: Array<{ name: string; description: string }>;
  let mockIpfsHash: string;
  let mockFiles: FileList;

  beforeEach(() => {
    assetClass = new Asset();
    mockFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    mockMetaData = [
      { name: 'File 1', description: 'Description 1' },
      { name: 'File 2', description: 'Description 2' },
    ];
    mockIpfsHash = 'mocked_ipfs_hash';
    const file1 = new File(['content of file 1'], 'file1.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    const file2 = new File(['content of file 2'], 'file2.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    // Define webkitRelativePath as a read-only property on the mock files
    Object.defineProperty(file1, 'webkitRelativePath', {
      value: 'folder1/file1.txt',
      writable: false,
    });
    Object.defineProperty(file2, 'webkitRelativePath', {
      value: 'folder1/file2.txt',
      writable: false,
    });

    mockFiles = new MockFileList([file1, file2]) as unknown as FileList;
  });

  it('should upload the file and return the IPFS hash', async () => {
    // Accessing the private method using type assertions
    const uploadAsset = assetClass['uploadAssetToPinata'].bind(assetClass);

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ IpfsHash: 'mocked_ipfs_hash' }),
      });

    const result = await uploadAsset(mockFile);

    expect(result).toBe('mocked_ipfs_hash');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(1, 'http://localhost:3000/asset/generate_key', {
      method: 'POST',
    });
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer mocked_jwt_token' },
      })
    );
  });

  it('should throw an error if the upload fails', async () => {
    const uploadAsset = assetClass['uploadAssetToPinata'].bind(assetClass);

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      .mockRejectedValueOnce(new Error('Upload failed'));

    await expect(uploadAsset(mockFile)).rejects.toThrow('Upload failed');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw "Unable to upload file" if the error object does not have a message', async () => {
    const uploadAsset = assetClass['uploadAssetToPinata'].bind(assetClass);

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      // Mock an error without a message property
      .mockRejectedValueOnce({});

    await expect(uploadAsset(mockFile)).rejects.toThrow('Unable to upload file');
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('should upload metadata files and return the IPFS hash', async () => {
    const uploadFolderMetaData = assetClass['uploadFolderMetaDataToPinataIpfs'].bind(assetClass);

    // Mock the fetch calls
    const fetchMock = jest
      .fn()
      // Mock the first fetch call for generating the JWT
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      // Mock the second fetch call for uploading to IPFS
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ IpfsHash: 'mocked_ipfs_hash' }),
      });

    // Override the global fetch with our mock
    global.fetch = fetchMock;

    const result = await uploadFolderMetaData(mockMetaData, mockIpfsHash);

    expect(result).toBe('mocked_ipfs_hash');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:3000/asset/generate_key', {
      method: 'POST',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer mocked_jwt_token' },
      })
    );

    // Check if formData was correctly constructed
    const formDataCall = fetchMock.mock.calls[1][1].body;
    const formDataKeys = Array.from(formDataCall.keys());

    expect(formDataKeys).toContain('file');
    expect(formDataKeys).toContain('pinataOptions');
  });

  it('should handle errors gracefully and log them', async () => {
    const uploadFolderMetaData = assetClass['uploadFolderMetaDataToPinataIpfs'].bind(assetClass);

    console.error = jest.fn(); // Mock console.error

    // Mock the fetch call to simulate a failed upload
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      .mockRejectedValueOnce(new Error('Upload failed'));

    global.fetch = fetchMock;

    const result = await uploadFolderMetaData(mockMetaData, mockIpfsHash);

    expect(result).toBeUndefined(); // Since the function returns nothing on error
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(new Error('Upload failed'));
  });

  it('should handle empty metadata without crashing', async () => {
    const uploadFolderMetaData = assetClass['uploadFolderMetaDataToPinataIpfs'].bind(assetClass);

    // Mock the fetch calls
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ IpfsHash: 'mocked_ipfs_hash' }),
      });

    global.fetch = fetchMock;

    const result = await uploadFolderMetaData([], mockIpfsHash);

    expect(result).toBe('mocked_ipfs_hash');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:3000/asset/generate_key', {
      method: 'POST',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer mocked_jwt_token' },
      })
    );

    const formDataCall = fetchMock.mock.calls[1][1].body;
    const formDataKeys = Array.from(formDataCall.keys());

    // The formData should contain only 'pinataOptions'
    expect(formDataKeys).toContain('pinataOptions');
    expect(formDataKeys).not.toContain('file');
  });

  it('should throw an error when type is different for file and meta data', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (assetClass.uploadAssetToIpfs as any)(mockFile, mockMetaData);
    expect(result).rejects.toThrow('Metadata should be of type object instead of array');
  });

  it('should upload the file to custom BE', async () => {
    const url = 'https://aws-presigned-url';
    const result = assetClass.uploadAssetToURL(mockFile, url);

    global.fetch = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ ok: true }),
    });

    expect(result).resolves.toBe(url);
  });

  it('should throw appropriate error on upload the file to custom BE', async () => {
    const url = 'https://aws-presigned-url';
    global.fetch = jest.fn().mockRejectedValue({
      message: 'Unable to upload to s3',
    });
    const result = assetClass.uploadAssetToURL(mockFile, url);

    expect(result).rejects.toThrow('Unable to upload to s3');
  });

  it('should throw custom error on upload the file to custom BE', async () => {
    const url = 'https://aws-presigned-url';
    global.fetch = jest.fn().mockRejectedValue({});
    const result = assetClass.uploadAssetToURL(mockFile, url);

    expect(result).rejects.toThrow('Some error occured while uploading file');
  });
  it('should upload file and metadata to Pinata', async () => {
    const file = new File(['file content'], 'file.txt', { type: 'text/plain' });
    const metaData = { name: 'Test file', description: 'Test description' };
    const folderId = 'folder123';

    // Mock the methods called in the function
    assetClass['uploadAssetToPinata'] = jest.fn().mockResolvedValue('mockedIpfsHash');
    assetClass['uploadMetaDataToPinataIpfs'] = jest
      .fn()

      .mockResolvedValue('mockedMetaDataHash');

    const result = await assetClass['uploadFileToProvider']('pinata', file, metaData, folderId);

    expect(result).toEqual({ ipfsHash: 'mockedIpfsHash', metaDataHash: 'mockedMetaDataHash' });
  });

  it('should upload file to Pinata and skip metadata upload if metadata is not provided', async () => {
    const file = new File(['file content'], 'file.txt', { type: 'text/plain' });

    // Mock the methods
    assetClass['uploadAssetToPinata'] = jest.fn().mockResolvedValue('mockedIpfsHash');
    assetClass['uploadMetaDataToPinataIpfs'] = jest.fn().mockResolvedValue(undefined);

    const result = assetClass['uploadFileToProvider']('pinata', file);

    expect(result).resolves.toEqual({ ipfsHash: 'mockedIpfsHash', metaDataHash: undefined });
  });

  it('should upload file and metadata to Filebase with folderId', async () => {
    const file = new File(['file content'], 'file.txt', { type: 'text/plain' });
    const metaData = { name: 'Test file', description: 'Test description' };
    const folderId = 'folder123';

    // Mock the methods
    assetClass['uploadAssetToFilebase'] = jest.fn().mockResolvedValue('mockedIpfsHash');
    assetClass['uploadMetaDataToFilebaseIpfs'] = jest.fn().mockResolvedValue('mockedMetaDataHash');

    const result = assetClass['uploadFileToProvider']('filebase', file, metaData, folderId);

    expect(result).resolves.toEqual({
      ipfsHash: 'mockedIpfsHash',
      metaDataHash: 'mockedMetaDataHash',
    });
  });

  it('should upload file to Filebase without folderId and metadata', async () => {
    const file = new File(['file content'], 'file.txt', { type: 'text/plain' });

    // Mock the methods
    assetClass['uploadAssetToFilebase'] = jest.fn().mockResolvedValue('mockedIpfsHash');
    assetClass['uploadMetaDataToFilebaseIpfs'] = jest.fn().mockResolvedValue(undefined);

    const result = assetClass['uploadFileToProvider']('filebase', file);

    expect(result).resolves.toEqual({ ipfsHash: 'mockedIpfsHash', metaDataHash: undefined });
  });

  it('should throw an error when upload to Pinata fails', async () => {
    const file = new File(['file content'], 'file.txt', { type: 'text/plain' });

    // Mock the uploadAssetToPinata to throw an error
    assetClass['uploadAssetToPinata'] = jest
      .fn()
      .mockRejectedValue(new Error('Pinata upload failed'));

    expect(assetClass['uploadFileToProvider']('pinata', file)).rejects.toThrow(
      'Pinata upload failed'
    );
  });

  it('should throw an error when upload to Filebase fails', async () => {
    const file = new File(['file content'], 'file.txt', { type: 'text/plain' });

    // Mock the uploadAssetToFilebase to throw an error
    assetClass['uploadAssetToFilebase'] = jest
      .fn()
      .mockRejectedValue(new Error('Filebase upload failed'));

    expect(assetClass['uploadFileToProvider']('filebase', file)).rejects.toThrow(
      'Filebase upload failed'
    );
  });

  it('should upload a folder and metadata to Pinata', async () => {
    const metaData = [{ name: 'Test folder', description: 'Test folder description' }];
    assetClass['uploadAssetFolderToIpfs'] = jest.fn().mockResolvedValue('mockedIpfsHash');
    assetClass['uploadFolderMetaDataToPinataIpfs'] = jest
      .fn()
      .mockResolvedValue('mockedMetaDataHash');

    const result = assetClass['uploadFolderToProvider'](mockFiles, metaData);

    expect(result).resolves.toEqual({
      ipfsHash: 'mockedIpfsHash',
      metaDataHash: 'mockedMetaDataHash',
    });
  });

  it('should upload a folder to Pinata without metadata', async () => {
    assetClass['uploadAssetFolderToIpfs'] = jest.fn().mockResolvedValue('mockedIpfsHash');

    const result = assetClass['uploadFolderToProvider'](mockFiles, undefined, 'pinata');

    expect(result).resolves.toEqual({ ipfsHash: 'mockedIpfsHash', metaDataHash: undefined });
  });

  it('should upload a folder and metadata to Filebase', async () => {
    const metaData = [{ name: 'Test folder', description: 'Test folder description' }];

    // Mock the methods
    assetClass['uploadAssetFolderToFilebase'] = jest
      .fn()
      .mockResolvedValue({ cid: 'mockedCid', folderId: 'mockedFolderId' });
    assetClass['uploadFolderMetaDataToFilebaseIpfs'] = jest
      .fn()
      .mockResolvedValue('mockedMetaDataHash');

    const result = assetClass['uploadFolderToProvider'](mockFiles, metaData, 'filebase');

    expect(result).resolves.toEqual({ ipfsHash: 'mockedCid', metaDataHash: 'mockedMetaDataHash' });
  });

  it('should upload a folder to Filebase without metadata', async () => {
    assetClass['uploadAssetFolderToFilebase'] = jest
      .fn()
      .mockResolvedValue({ cid: 'mockedCid', folderId: 'mockedFolderId' });

    const result = assetClass['uploadFolderToProvider'](mockFiles, undefined, 'filebase');

    expect(result).resolves.toEqual({ ipfsHash: 'mockedCid', metaDataHash: undefined });
  });

  it('should throw an error when uploading a folder to Pinata fails', async () => {
    assetClass['uploadAssetFolderToIpfs'] = jest
      .fn()
      .mockRejectedValue(new Error('Pinata folder upload failed'));

    expect(assetClass['uploadFolderToProvider'](mockFiles, undefined, 'pinata')).rejects.toThrow(
      'Pinata folder upload failed'
    );
  });

  it('should throw an error when uploading a folder to Filebase fails', async () => {
    // Mock the uploadAssetFolderToFilebase to throw an error
    assetClass['uploadAssetFolderToFilebase'] = jest
      .fn()
      .mockRejectedValue(new Error('Filebase folder upload failed'));

    expect(assetClass['uploadFolderToProvider'](mockFiles, undefined, 'filebase')).rejects.toThrow(
      'Filebase folder upload failed'
    );
  });

  it('should upload folder metadata and return the CID', async () => {
    const mockMetaData = [
      { name: 'File 1', description: 'Description 1' },
      { name: 'File 2', description: 'Description 2' },
    ];
    const mockIpfsHash = 'mockIpfsHash';
    const mockFolderId = 'mockFolderId';

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });

    const result = assetClass['uploadFolderMetaDataToFilebaseIpfs'](
      mockMetaData,
      mockIpfsHash,
      mockFolderId
    );

    expect(result).resolves.toBe('mockedCid');
  });

  it('should append correct files and folderName to FormData', async () => {
    const mockMetaData = [
      { name: 'File 1', description: 'Description 1' },
      { name: 'File 2', description: 'Description 2' },
    ];
    const mockIpfsHash = 'mockIpfsHash';
    const mockFolderId = 'mockFolderId-metadata-folder';

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });

    await assetClass['uploadFolderMetaDataToFilebaseIpfs'](
      mockMetaData,
      mockIpfsHash,
      mockFolderId
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchCallFormData = (global.fetch as any).mock.calls[0][1].body;

    expect(fetchCallFormData.getAll('file').length).toBe(2);
  });

  it('should handle cases for folder name split failure', async () => {
    const mockMetaData = [
      { name: 'File 1', description: 'Description 1' },
      { name: 'File 2', description: 'Description 2' },
    ];
    const mockIpfsHash = 'mockIpfsHash';
    const mockFolderId = undefined;

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });

    await assetClass['uploadFolderMetaDataToFilebaseIpfs'](
      mockMetaData,
      mockIpfsHash,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockFolderId as any
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchCallFormData = (global.fetch as any).mock.calls[0][1].body;

    expect(fetchCallFormData.getAll('file').length).toBe(2);
  });

  it('should handle and log errors gracefully', async () => {
    const mockMetaData = [{ name: 'File 1', description: 'Description 1' }];
    const mockIpfsHash = 'mockIpfsHash';
    const mockFolderId = 'mockFolderId';

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = jest.fn().mockRejectedValue(new Error('Upload failed'));

    const result = await assetClass['uploadFolderMetaDataToFilebaseIpfs'](
      mockMetaData,
      mockIpfsHash,
      mockFolderId
    );

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should construct the correct folder name based on folderId', async () => {
    const mockMetaData = [{ name: 'File 1', description: 'Description 1' }];
    const mockIpfsHash = 'mockIpfsHash';
    const mockFolderId = 'mockFolderId-abc-def';

    // Mock fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });

    await assetClass['uploadFolderMetaDataToFilebaseIpfs'](
      mockMetaData,
      mockIpfsHash,
      mockFolderId
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchCallFormData = (global.fetch as any).mock.calls[0][1].body;
    expect(fetchCallFormData.get('folderName')).toBe('def-meta-data-folder');
  });

  it('should upload metadata and return CID when metaData and ipfsHash are provided', async () => {
    const mockMetaData = { name: 'File 1', description: 'Description 1' };
    const mockIpfsHash = 'mockIpfsHash';
    const mockFolderId = 'mockFolderId';

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });

    const result = await assetClass['uploadMetaDataToFilebaseIpfs'](
      mockMetaData,
      mockIpfsHash,
      mockFolderId
    );

    expect(result).toBe('mockedCid');
  });

  it('should append correct file and folderId to FormData', async () => {
    const mockMetaData = { name: 'File 1', description: 'Description 1' };
    const mockIpfsHash = 'mockIpfsHash';
    const mockFolderId = 'mockFolderId';

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });

    await assetClass['uploadMetaDataToFilebaseIpfs'](mockMetaData, mockIpfsHash, mockFolderId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchCallFormData = (global.fetch as any).mock.calls[0][1].body;

    expect(fetchCallFormData.get('file')).toBeInstanceOf(File);
    expect(fetchCallFormData.get('folderId')).toBe(mockFolderId);
  });

  it('should return undefined when metaData or ipfsHash is not provided', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });
    const result = await assetClass['uploadMetaDataToFilebaseIpfs'](undefined, undefined);

    expect(result).toBeUndefined();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should handle and return error when fetch fails', async () => {
    const mockMetaData = { name: 'File 1', description: 'Description 1' };
    const mockIpfsHash = 'mockIpfsHash';
    const mockFolderId = 'mockFolderId';

    const mockError = new Error('Upload failed');
    global.fetch = jest.fn().mockRejectedValue(mockError);

    const result = await assetClass['uploadMetaDataToFilebaseIpfs'](
      mockMetaData,
      mockIpfsHash,
      mockFolderId
    );

    expect(result).toBe(mockError);
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should create correct JSON Blob with metadata and ipfsHash', async () => {
    const mockMetaData = { name: 'File 1', description: 'Description 1' };
    const mockIpfsHash = 'mockIpfsHash';
    const mockFolderId = 'mockFolderId';

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });

    await assetClass['uploadMetaDataToFilebaseIpfs'](mockMetaData, mockIpfsHash, mockFolderId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchCallFormData = (global.fetch as any).mock.calls[0][1].body;
    const uploadedFile = fetchCallFormData.get('file');

    expect(uploadedFile).toBeInstanceOf(File);
    expect(uploadedFile.name).toBe(mockIpfsHash);
    expect(uploadedFile.type).toBe('application/json');
  });

  it('should upload the file and return CID when the request is successful', async () => {
    const mockFile = new File(['file content'], 'testfile.txt', { type: 'text/plain' });
    const mockFolderId = 'mockFolderId';
    const mockCid = 'mockedCid';

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: mockCid }),
    });

    const result = await assetClass['uploadAssetToFilebase'](mockFile, mockFolderId);

    expect(result).toBe(mockCid);
  });

  it('should append correct file and folderId to FormData', async () => {
    const mockFile = new File(['file content'], 'testfile.txt', { type: 'text/plain' });
    const mockFolderId = 'mockFolderId';

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });

    await assetClass['uploadAssetToFilebase'](mockFile, mockFolderId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchCallFormData = (global.fetch as any).mock.calls[0][1].body;

    expect(fetchCallFormData.get('file')).toBe(mockFile);
    expect(fetchCallFormData.get('folderId')).toBe(mockFolderId);
  });

  it('should append an empty string as folderId if not provided', async () => {
    const mockFile = new File(['file content'], 'testfile.txt', { type: 'text/plain' });

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid' }),
    });

    await assetClass['uploadAssetToFilebase'](mockFile);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetchCallFormData = (global.fetch as any).mock.calls[0][1].body;

    expect(fetchCallFormData.get('folderId')).toBe('');
  });

  it('should throw an error when the fetch request fails', async () => {
    const mockFile = new File(['file content'], 'testfile.txt', { type: 'text/plain' });
    const mockError = new Error('Upload failed');

    // Mock the fetch response to fail
    global.fetch = jest.fn().mockRejectedValue(mockError);

    await expect(assetClass['uploadAssetToFilebase'](mockFile)).rejects.toThrow('Upload failed');
  });

  it('should throw a generic error message when no specific error message is provided', async () => {
    const mockFile = new File(['file content'], 'testfile.txt', { type: 'text/plain' });

    // Mock the fetch response to fail without a message
    global.fetch = jest.fn().mockRejectedValue({});

    await expect(assetClass['uploadAssetToFilebase'](mockFile)).rejects.toThrow(
      'Unable to upload file'
    );
  });

  it('should upload the folder and return CID and folderId when the request is successful', async () => {
    const mockCid = 'mockedCid';
    const mockFolderId = 'mockedFolderId';

    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: mockCid, folderId: mockFolderId }),
    });
    const file1 = new File(['content of file 1'], 'file1.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    const file2 = new File(['content of file 2'], 'file2.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    // Define webkitRelativePath as a read-only property on the mock files
    Object.defineProperty(file1, 'webkitRelativePath', {
      value: 'folder1/file1.txt',
      writable: false,
    });
    Object.defineProperty(file2, 'webkitRelativePath', {
      value: 'folder1/file2.txt',
      writable: false,
    });
    const result = await assetClass['uploadAssetFolderToFilebase']([
      file1,
      file2,
    ] as unknown as FileList);

    expect(result.cid).toBe(mockCid);
    expect(result.folderId).toBe(mockFolderId);
  });

  it('should correctly append files to FormData', async () => {
    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid', folderId: 'mockedFolderId' }),
    });
    const file1 = new File(['content of file 1'], 'file1.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    const file2 = new File(['content of file 2'], 'file2.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    // Define webkitRelativePath as a read-only property on the mock files
    Object.defineProperty(file1, 'webkitRelativePath', {
      value: 'folder1/file1.txt',
      writable: false,
    });
    Object.defineProperty(file2, 'webkitRelativePath', {
      value: 'folder1/file2.txt',
      writable: false,
    });
    await assetClass['uploadAssetFolderToFilebase']([file1, file2] as unknown as FileList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData = (global.fetch as any).mock.calls[0][1].body;

    // Check that files are correctly appended
    expect(formData.getAll('file')).toHaveLength(2);
  });

  it('should correctly append the folder name to FormData', async () => {
    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue({ cid: 'mockedCid', folderId: 'mockedFolderId' }),
    });
    const file1 = new File(['content of file 1'], 'file1.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    const file2 = new File(['content of file 2'], 'file2.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    // Define webkitRelativePath as a read-only property on the mock files
    Object.defineProperty(file1, 'webkitRelativePath', {
      value: 'folder1/file1.txt',
      writable: false,
    });
    Object.defineProperty(file2, 'webkitRelativePath', {
      value: 'folder1/file2.txt',
      writable: false,
    });
    await assetClass['uploadAssetFolderToFilebase']([file1, file2] as unknown as FileList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formData = (global.fetch as any).mock.calls[0][1].body;

    // Check that folderName is correctly appended
    expect(formData.get('folderName')).toBe('folder1/');
  });

  it('should throw an error if fetch request fails', async () => {
    const mockError = new Error('Upload failed');

    // Mock fetch to reject
    global.fetch = jest.fn().mockRejectedValue(mockError);
    const file1 = new File(['content of file 1'], 'file1.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    const file2 = new File(['content of file 2'], 'file2.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    // Define webkitRelativePath as a read-only property on the mock files
    Object.defineProperty(file1, 'webkitRelativePath', {
      value: 'folder1/file1.txt',
      writable: false,
    });
    Object.defineProperty(file2, 'webkitRelativePath', {
      value: 'folder1/file2.txt',
      writable: false,
    });
    expect(
      assetClass['uploadAssetFolderToFilebase']([file1, file2] as unknown as FileList)
    ).rejects.toThrow('Upload failed');
  });

  it('should throw a generic error message if no specific error is provided', async () => {
    // Mock fetch to reject without a specific error message
    global.fetch = jest.fn().mockRejectedValue({});
    const file1 = new File(['content of file 1'], 'file1.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    const file2 = new File(['content of file 2'], 'file2.txt', {
      type: 'text/plain',
      lastModified: Date.now(),
    });

    // Define webkitRelativePath as a read-only property on the mock files
    Object.defineProperty(file1, 'webkitRelativePath', {
      value: 'folder1/file1.txt',
      writable: false,
    });
    Object.defineProperty(file2, 'webkitRelativePath', {
      value: 'folder1/file2.txt',
      writable: false,
    });

    expect(
      assetClass['uploadAssetFolderToFilebase']([file1, file2] as unknown as FileList)
    ).rejects.toThrow('Unable to upload file');
  });
});
