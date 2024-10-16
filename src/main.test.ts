import { baseSepolia, initKorSDK } from './main';
import { Base } from './module/base';

describe('Utility | Main', () => {
  it('should initialise sdk object of class instance Base', async () => {
    const fetchMock = jest
      .fn()
      // Mock the first fetch call for generating the JWT
      .mockResolvedValueOnce({
        ok: true, // Simulate a successful response
      });
    global.fetch = fetchMock;
    const result = await initKorSDK('privateKey', { chain: baseSepolia, rpc: '' });
    expect(result).toBeInstanceOf(Base);
  });

  it('should throw an error on invalid api key', async () => {
    try {
      const fetchMock = jest.fn().mockResolvedValueOnce({
        ok: false,
      });
      global.fetch = fetchMock;
      expect(initKorSDK('', { chain: baseSepolia, rpc: '' })).rejects.toThrow(Error);
    } catch (error) {
      expect((error as { message: string }).message).toBe('invalid key');
    }
  });
});
