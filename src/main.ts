import { Config, createConfig, type GetConnectorClientReturnType } from '@wagmi/core';
import { Base } from './module/base';
import { IFolderData, KorChain } from './types';
import { Chain, HttpTransport, http } from 'viem';
import { getApiUrl, setOrigin } from './utils';
import { supportedChains } from './chains';

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

export const initKorSDK = async (
  key: string,
  { chain, rpc, origin }: { chain: KorChain; rpc: string; origin?: string }
) => {
  apiKey = key;
  if (origin) {
    setOrigin(origin);
  }
  const res = await fetch(`${getApiUrl()}/user/api-key/validate/${key}`);
  await createKorConfig(chain, rpc);
  if (res.ok) {
    return new Base();
  } else {
    throw new Error('invalid key');
  }
};

const createKorConfig = async (chain: KorChain, rpc: string) => {
  config = createConfig({
    chains: [supportedChains[chain]],
    transports: {
      [chain]: http(rpc),
    },
    syncConnectedChain: true,
  });
};

export type KorObjType = Base;
export type FolderDataType = IFolderData;
export type KorChainType = KorChain;

export * from './chains';
