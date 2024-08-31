import { Asset } from './asset';

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

    mockFiles = {
      0: file1,
      1: file2,
      length: 2,
      item: (index) => [file1, file2][index],
    };
  });

  it('should upload folder files and return the IPFS hash', async () => {
    const uploadAssetFolder = assetClass['uploadAssetFolder'].bind(assetClass);

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
    const uploadAssetFolder = assetClass['uploadAssetFolder'].bind(assetClass);

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
    const uploadAssetFolder = assetClass['uploadAssetFolder'].bind(assetClass);

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
    const uploadAssetFolder = assetClass['uploadAssetFolder'].bind(assetClass);

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
});
