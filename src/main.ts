import { Base } from './module/base';

export const initialiseKorSDK = (key: string) => {
  if (key === 'privateKey') {
    return new Base();
  } else {
    throw new Error('invalid key');
  }
};
