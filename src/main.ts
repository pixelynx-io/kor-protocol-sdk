import { Config, createConfig, type GetConnectorClientReturnType } from '@wagmi/core';
import { Base } from './module/base';
import { IFolderData, KorChain } from './types';
import { Chain, HttpTransport, http } from 'viem';
import { getApiUrl, setOrigin } from './utils';
import { supportedChains } from './chains';
import { CONFLICT_TIER } from './enums';

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
  {
    chain,
    rpc,
    origin,
    recaptchaToken,
  }: { chain: KorChain; rpc: string; origin?: string; recaptchaToken?: string }
) => {
  apiKey = key;
  if (origin) {
    setOrigin(origin);
  }
  const recaptchaParam = recaptchaToken ? `?recaptchaToken=${recaptchaToken}` : '';
  const res = await fetch(`${getApiUrl()}/user/api-key/validate/${key}${recaptchaParam}`);
  await createKorConfig(chain, rpc);
  if (res.ok) {
    return new Base();
  } else {
    const response = await res.json();
    throw new Error(response.message ?? 'invalid key');
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
export { CONFLICT_TIER };

export * from './chains';
