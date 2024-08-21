import { initialiseKorSDK } from './main';
import { Base } from './module/base';

describe('Utility | Main', () => {
  it('should initialise sdk object of class instance Base', async () => {
    expect(initialiseKorSDK('privateKey')).toBeInstanceOf(Base);
  });

  it('should throw an error on invalid api key', async () => {
    try {
      expect(initialiseKorSDK('')).toThrow(Error);
    } catch (error) {
      expect((error as { message: string }).message).toBe('invalid key');
    }
  });
});
