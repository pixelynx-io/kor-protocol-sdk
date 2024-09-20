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

describe('AssetClass - uploadAssetFolder', () => {
  let assetClass: Asset;
  let mockFiles: Partial<FileList>;

  beforeEach(() => {
    assetClass = new Asset();

    // Create a mock FileList object
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

  it('should upload folder files and return the IPFS hash', async () => {
    const uploadAssetFolder = assetClass['uploadAssetFolderToIpfs'].bind(assetClass);

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

    global.fetch = fetchMock;

    const result = await uploadAssetFolder(mockFiles as FileList);

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

    // Verify that the files were correctly added to the FormData with directory paths
    expect(formDataCall.get('file')).not.toBeNull();
  });

  it('should handle errors gracefully and throw an error', async () => {
    const uploadAssetFolder = assetClass['uploadAssetFolderToIpfs'].bind(assetClass);

    // Mock the fetch call to simulate a failed upload
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      .mockRejectedValueOnce(new Error('Upload failed'));

    global.fetch = fetchMock;

    await expect(uploadAssetFolder(mockFiles as FileList)).rejects.toThrow('Upload failed');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should handle empty FileList without crashing', async () => {
    const uploadAssetFolder = assetClass['uploadAssetFolderToIpfs'].bind(assetClass);

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

    const emptyFileList = { length: 0, item: () => null };

    const result = await uploadAssetFolder(emptyFileList as unknown as FileList);

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

  it('should throw a default error message "Unable to upload file" if the error does not have a message', async () => {
    const uploadAssetFolder = assetClass['uploadAssetFolderToIpfs'].bind(assetClass);

    // Mock the fetch call to simulate a failed upload without a message property
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      .mockRejectedValueOnce({}); // Simulate an error without a message property

    global.fetch = fetchMock;

    await expect(uploadAssetFolder(mockFiles as FileList)).rejects.toThrow('Unable to upload file');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should throw an error when fileList and meta data length is different', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (assetClass.uploadAssetToIpfs as any)(mockFiles, [
      { name: 'abc', description: 'abc' },
    ]);
    expect(result).rejects.toThrow('Metadata length should match with file array');
  });

  it('should throw an error when file param is missing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (assetClass.uploadAssetToIpfs as any)();
    expect(result).rejects.toThrow('File param is mandatory to call uploadAssetToIpfs');
  });

  it('should create a folder when called createFolder function', async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ folderId: 'folder-name-asd' }),
    });

    global.fetch = fetchMock;

    const result = assetClass.createFolder('folder-name', false);
    expect(result).resolves.toEqual({ folderId: 'folder-name-asd' });
  });

  it('should throw an error when function name is not passed', async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ folderId: 'folder-name-asd' }),
    });

    global.fetch = fetchMock;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (assetClass.createFolder as any)();
    expect(result).rejects.toThrow(Error);
  });
  it('should throw an error when api fails', async () => {
    const fetchMock = jest.fn().mockRejectedValue({
      message: 'error while creating folder',
    });

    global.fetch = fetchMock;

    const result = assetClass.createFolder('folder-name', true);
    expect(result).rejects.toThrow('error while creating folder');
  });
  it('should throw an error when api fails and show custom error', async () => {
    const fetchMock = jest.fn().mockRejectedValue({});

    global.fetch = fetchMock;

    const result = assetClass.createFolder('folder-name', true);
    expect(result).rejects.toThrow('Error while creating folder');
  });

  it('should generate folder CID and metadata hash successfully', async () => {
    const folderId = 'folder123';

    // Mock fetch to simulate API responses
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ cid: 'folderCID123' }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ cid: 'metadataCID456' }),
      });

    const result = await assetClass.generateFolderCID(folderId);

    expect(result).toEqual({
      ipfsHash: 'folderCID123',
      metaDataHash: 'metadataCID456',
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw an error when no folderId is provided', async () => {
    await expect(assetClass.generateFolderCID('')).rejects.toThrow(
      'Folder id should be provided to create a new folder'
    );
  });

  it('should throw an error if fetch fails for one of the requests', async () => {
    const folderId = 'folder123';

    // Mock fetch to simulate a failure on the second call
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ cid: 'folderCID123' }),
      })
      .mockRejectedValueOnce(new Error('Failed to generate metadata CID'));

    await expect(assetClass.generateFolderCID(folderId)).rejects.toThrow(
      'Failed to generate metadata CID'
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should throw a default error message if no error message is provided', async () => {
    const folderId = 'folder123';

    // Mock fetch to simulate a generic failure
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ cid: 'folderCID123' }),
      })
      .mockRejectedValueOnce({});

    await expect(assetClass.generateFolderCID(folderId)).rejects.toThrow(
      'Error while creating folder'
    );
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should return an empty ipfsHash and metaDataHash when the response array is empty', async () => {
    const folderId = 'folder123';

    // Mock fetch to return an empty array
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue([]), // Empty array for the first fetch
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue([]), // Empty array for the second fetch
      });

    const result = await assetClass.generateFolderCID(folderId);

    expect(result).toEqual({
      ipfsHash: undefined,
      metaDataHash: undefined,
    });
  });

  it('should return an empty metaDataHash when only one fetch succeeds', async () => {
    const folderId = 'folder123';

    // Mock fetch to return only one valid result
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ cid: 'folderCID123' }), // First fetch returns a valid CID
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({}), // Second fetch returns an empty object
      });

    const result = await assetClass.generateFolderCID(folderId);

    expect(result).toEqual({
      ipfsHash: 'folderCID123',
      metaDataHash: undefined, // metaDataHash should be empty since second response has no CID
    });
  });

  it('should return undefined ipfsHash and metaDataHash when both fetch responses are undefined', async () => {
    const folderId = 'folder123';

    // Mock fetch to return undefined values
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(undefined), // First fetch returns undefined
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue(undefined), // Second fetch returns undefined
      });

    const result = await assetClass.generateFolderCID(folderId);

    expect(result).toEqual({
      ipfsHash: undefined, // ipfsHash should be undefined since first response is undefined
      metaDataHash: undefined, // metaDataHash should be empty since second response is undefined
    });
  });

  it('should return valid ipfsHash and an empty metaDataHash when json length is less than 2', async () => {
    const folderId = 'folder123';

    // Mock fetch to return only one valid result
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ cid: 'folderCID123' }), // First fetch returns a valid CID
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue([]), // Second fetch returns an empty array
      });

    const result = await assetClass.generateFolderCID(folderId);

    expect(result).toEqual({
      ipfsHash: 'folderCID123',
      metaDataHash: undefined, // metaDataHash should be empty since the second fetch returns an empty array
    });
  });

  it('should return when json data itself is undefined', async () => {
    const folderId = 'folder123';

    // Mock fetch to return only one valid result
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ cid: 'folderCID123' }), // First fetch returns a valid CID
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue([{ cid: 'folderCID1234' }]), // Second fetch returns an empty array
      });

    const result = await assetClass.generateFolderCID(folderId);

    expect(result).toEqual({
      ipfsHash: 'folderCID123',
      metaDataHash: undefined, // metaDataHash should be empty since the second fetch returns an empty array
    });
  });
});
