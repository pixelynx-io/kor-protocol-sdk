import { Asset } from './asset';

describe('AssetClass - uploadMetaDataToIpfs', () => {
  let assetClass: Asset;

  beforeEach(() => {
    assetClass = new Asset();
  });

  it('should upload metadata to IPFS and return the IPFS hash when metaData and ipfsHash are provided', async () => {
    const uploadMetaDataToIpfs = assetClass['uploadMetaDataToPinataIpfs'].bind(assetClass);

    const mockMetaData = { name: 'Test NFT', description: 'Test Description' };
    const mockIpfsHash = 'mocked_ipfs_hash';

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

    const result = await uploadMetaDataToIpfs(mockMetaData, mockIpfsHash);

    expect(result).toBe('mocked_ipfs_hash');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:3000/asset/generate_key', {
      method: 'POST',
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mocked_jwt_token',
        },
        body: JSON.stringify({
          pinataContent: { ...mockMetaData, image: `ipfs://${mockIpfsHash}` },
          pinataMetadata: { ...mockMetaData, image: `ipfs://${mockIpfsHash}` },
        }),
      })
    );
  });

  it('should not make any fetch calls and return undefined if metaData or ipfsHash is not provided', async () => {
    const uploadMetaDataToIpfs = assetClass['uploadMetaDataToPinataIpfs'].bind(assetClass);

    const fetchMock = jest.fn();
    global.fetch = fetchMock;

    // Case 1: metaData is missing
    const result1 = await uploadMetaDataToIpfs(undefined, 'mocked_ipfs_hash');
    expect(result1).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();

    // Case 2: ipfsHash is missing
    const result2 = await uploadMetaDataToIpfs({ name: 'Test NFT' }, undefined);
    expect(result2).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();

    // Case 3: Both are missing
    const result3 = await uploadMetaDataToIpfs(undefined, undefined);
    expect(result3).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should return the error if an exception occurs during the fetch calls', async () => {
    const uploadMetaDataToIpfs = assetClass['uploadMetaDataToPinataIpfs'].bind(assetClass);

    const mockMetaData = { name: 'Test NFT', description: 'Test Description' };
    const mockIpfsHash = 'mocked_ipfs_hash';

    // Mock the fetch call to simulate an error
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      .mockRejectedValueOnce(new Error('Upload failed'));

    global.fetch = fetchMock;

    const result = await uploadMetaDataToIpfs(mockMetaData, mockIpfsHash);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Upload failed');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should handle errors gracefully if fetch response is invalid', async () => {
    const uploadMetaDataToIpfs = assetClass['uploadMetaDataToPinataIpfs'].bind(assetClass);

    const mockMetaData = { name: 'Test NFT', description: 'Test Description' };
    const mockIpfsHash = 'mocked_ipfs_hash';

    // Mock the fetch call to return invalid JSON
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        json: jest.fn().mockResolvedValue({ jwt: 'mocked_jwt_token' }),
      })
      .mockResolvedValueOnce({
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      });

    global.fetch = fetchMock;

    const result = await uploadMetaDataToIpfs(mockMetaData, mockIpfsHash);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('Invalid JSON');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
