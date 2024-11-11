import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig, getKey } from '../../main';
import {
  IAttachLicense,
  ICreateCustomLicense,
  ICreateExternalLicense,
  ICreateSmartLicense,
} from '../../types';
import { decodeEventLog, parseUnits } from 'viem';
import { generateSignature, getApiUrl, getContractAddresses } from '../../utils';
import { licenseModuleAbi } from '../../abis/license-module';

export class OnChainLicenseModule {
  async createSmartLicense(input: ICreateSmartLicense, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);
    const licenseData = await this.createLicensePDF(address, input);
    const licenseURI = `https://ipfs.io/ipfs/${licenseData?.licenseCid}`;
    const data = await writeContract(getConfig()!, {
      abi: licenseModuleAbi,
      address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
      functionName: 'createSmartLicenseEncoded',
      args: [
        input.isRoyaltyAllowed,
        input.isCommercialUseAllowed,
        input.isExpirable,
        input.isDerivativeAllowed,
        parseUnits(`${input.licenseFee}`, 18),
        licenseURI,
        encodedData,
        signature,
      ],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: licenseModuleAbi,
      data: transactionResponse.logs[0].data,
      topics: transactionResponse.logs[0].topics,
    });
    return {
      transactionResponse,
      result: { ...topics.args, licenseURI: licenseURI },
    };
  }

  async createCustomLicense(input: ICreateCustomLicense, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);
    const licenseData = await this.createLicensePDF(address, input);
    const licenseURI = `https://ipfs.io/ipfs/${licenseData?.licenseCid}`;

    const data = await writeContract(getConfig()!, {
      abi: licenseModuleAbi,
      address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
      functionName: 'createCustomLicenseEncoded',
      args: [
        input.isRoyaltyAllowed,
        input.isCommercialUseAllowed,
        input.isExpirable,
        input.isDerivativeAllowed,
        parseUnits(`${input.licenseFee}`, 18),
        licenseURI,
        encodedData,
        signature,
      ],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: licenseModuleAbi,
      data: transactionResponse.logs[0].data,
      topics: transactionResponse.logs[0].topics,
    });
    return {
      transactionResponse,
      result: { ...topics.args, licenseURI: licenseURI },
    };
  }

  async createExternalLicense(input: ICreateExternalLicense, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: licenseModuleAbi,
      address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
      functionName: 'createExternalLicenseEncoded',
      args: [input.licenseURI, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });
    const topics = decodeEventLog({
      abi: licenseModuleAbi,
      data: transactionResponse.logs[0].data,
      topics: transactionResponse.logs[0].topics,
    });
    return {
      transactionResponse,
      result: { ...topics.args },
    };
  }

  async attachSmartLicense(input: IAttachLicense, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: licenseModuleAbi,
      address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
      functionName: 'attachSmartLicenseEncoded',
      args: [input.ipId, input.licenseTermId, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });

    return { transactionResponse, result: true };
  }

  async attachCustomLicense(input: IAttachLicense, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: licenseModuleAbi,
      address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
      functionName: 'attachCustomLicenseEncoded',
      args: [input.ipId, input.licenseTermId, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });

    return { transactionResponse, result: true };
  }

  async attachExternalLicense(input: IAttachLicense, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: licenseModuleAbi,
      address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
      functionName: 'attachExternalLicenseEncoded',
      args: [input.ipId, input.licenseTermId, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });

    return { transactionResponse, result: true };
  }

  private readonly createLicensePDF = async (
    senderWalletAddress: `0x${string}`,
    keys: ICreateCustomLicense | ICreateSmartLicense
  ) => {
    try {
      const licensePDFResponse = await fetch(`${getApiUrl()}/license/license-pdf`, {
        method: 'POST',
        body: JSON.stringify({ senderWalletAddress, ...keys }),
        headers: { 'api-key': getKey(), 'Content-Type': 'application/json' },
      });
      if (!licensePDFResponse.ok) {
        throw new Error('Failed to create license PDF');
      }
      return await licensePDFResponse.json();
    } catch (error) {
      throw new Error((error as { message: string }).message ?? 'Failed to create license PDF');
    }
  };
}
