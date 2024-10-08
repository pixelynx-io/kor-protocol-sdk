import { reconnect, waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig, getKey } from '../../main';
import { IRegisterDerivative, IRegisterNFT } from '../../types';
import { IP_CONTRACT_ADDRESS, ipModuleABI } from '../../abis/ip-module';

export class IPModule {
  async registerNFT(data: IRegisterNFT) {
    await reconnect(getConfig()!);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/ip-module/register-nft/${getConfig()?.chains[0]?.id}`,
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
      return transactionResponse;
    }

    throw new Error((await response.json())?.message);
  }

  async registerDerivates(data: IRegisterDerivative) {
    await reconnect(getConfig()!);
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/ip-module/register-derivative/${getConfig()?.chains[0]?.id}`,
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
      return transactionResponse;
    }

    throw new Error((await response.json())?.message);
  }
}
