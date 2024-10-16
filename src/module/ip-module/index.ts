import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig, getKey } from '../../main';
import { IRegisterDerivative, IRegisterNFT } from '../../types';
import { IP_CONTRACT_ADDRESS, ipModuleABI } from '../../abis/ip-module';
import { decodeEventLog } from 'viem';
import { getApiUrl } from '../../utils';

export class IPModule {
  async registerNFT(data: IRegisterNFT) {
    const response = await fetch(
      `${getApiUrl()}/ip-module/register-nft/${getConfig()?.chains[0]?.id}`,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
      }
    );
    if (response.ok) {
      const { encodedData, signature } = await response.json();
      const data = await writeContract(getConfig()!, {
        abi: ipModuleABI,
        address: IP_CONTRACT_ADDRESS,
        functionName: 'registerNFTEncoded',
        args: [encodedData, signature],
      });
      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      const topics = decodeEventLog({
        abi: ipModuleABI,
        data: transactionResponse.logs[2].data,
        topics: transactionResponse.logs[2].topics,
      });
      return { transactionResponse, result: { ...topics.args } };
    }

    throw new Error((await response.json())?.message);
  }

  async registerDerivates(data: IRegisterDerivative) {
    const response = await fetch(
      `${getApiUrl()}/ip-module/register-derivative/${getConfig()?.chains[0]?.id}`,
      {
        body: JSON.stringify(data),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
      }
    );
    if (response.ok) {
      const { encodedData, signature } = await response.json();
      const data = await writeContract(getConfig()!, {
        abi: ipModuleABI,
        address: IP_CONTRACT_ADDRESS,
        functionName: 'registerDerivativeEncoded',
        args: [encodedData, signature],
      });
      const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
      const topics = decodeEventLog({
        abi: ipModuleABI,
        data: transactionResponse.logs[2].data,
        topics: transactionResponse.logs[2].topics,
      });
      return { transactionResponse, result: { ...topics.args } };
    }

    throw new Error((await response.json())?.message);
  }
}
