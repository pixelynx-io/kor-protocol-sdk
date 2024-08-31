import { Asset } from './asset';

describe('AssetClass', () => {
  let assetClass: Asset;
  let mockFile: File;
  let mockMetaData: Array<{ name: string; description: string }>;
  let mockIpfsHash: string;

  beforeEach(() => {
    assetClass = new Asset();
    mockFile = new File(['dummy content'], 'test.txt', { type: 'text/plain' });
    mockMetaData = [
      { name: 'File 1', description: 'Description 1' },
      { name: 'File 2', description: 'Description 2' },
    ];
    mockIpfsHash = 'mocked_ipfs_hash';
  });

  it('should upload the file and return the IPFS hash', async () => {
    // Accessing the private method using type assertions
    const uploadAsset = assetClass['uploadAsset'].bind(assetClass);

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
    const uploadAsset = assetClass['uploadAsset'].bind(assetClass);

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
    const uploadAsset = assetClass['uploadAsset'].bind(assetClass);

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
    const uploadFolderMetaData = assetClass['uploadFolderMetaData'].bind(assetClass);

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
    const uploadFolderMetaData = assetClass['uploadFolderMetaData'].bind(assetClass);

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
    const uploadFolderMetaData = assetClass['uploadFolderMetaData'].bind(assetClass);

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
});
