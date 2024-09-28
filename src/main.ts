import { Config, createConfig, type GetConnectorClientReturnType } from '@wagmi/core';
import { Base } from './module/base';
import { IFolderData } from './types';
import { Chain, HttpTransport, http } from 'viem';

let config:
  | Config<
      readonly [Chain],
      {
        [x: number]: HttpTransport;
      }
    >
  | undefined = undefined;

let walletClient: GetConnectorClientReturnType;
let apiKey = '';
export const getConfig = () => config;

export const getWalletClient = () => walletClient;

export const getKey = () => apiKey;

export const initialiseKorSDK = async (
  key: string,
  { chain, rpc }: { chain: KorChain; rpc: string }
) => {
  apiKey = key;
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/api-key/validate/${key}`);
  await createKorConfig(chain, rpc);
  if (res.ok) {
    return new Base();
  } else {
    throw new Error('invalid key');
  }
};

const createKorConfig = async (chain: KorChain, rpc: string) => {
  config = createConfig({
    chains: [chain],
    transports: {
      [chain.id]: http(rpc),
    },
    syncConnectedChain: true,
  });
};

export type KorObjType = Base;
export type FolderDataType = IFolderData;
export type KorChain = Chain;

export * from './chains';
