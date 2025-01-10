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
let captchaToken = '';
export const getConfig = () => config;

export const getWalletClient = () => walletClient;

export const getKey = () => apiKey;

export const getCaptchaToken = () => captchaToken;

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
  const res = await fetch(`${getApiUrl()}/organization/api-key/validate/${key}${recaptchaParam}`);
  await createKorConfig(chain, rpc);
  const validateResponse = await res.json();
  if (res.ok) {
    captchaToken = validateResponse.captchaToken ?? '';
    return new Base();
  } else {
    throw new Error(validateResponse.message ?? 'invalid key');
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
