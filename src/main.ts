import { Base } from './module/base';
import { IFolderData } from './types';

export const initialiseKorSDK = async (key: string) => {
  const res = await fetch(`http://localhost:3000/user/api-key/validate/${key}`);
  if (res.ok) {
    return new Base();
  } else {
    throw new Error('invalid key');
  }
};

export type KorObjType = Base;
export type FolderDataType = IFolderData;
