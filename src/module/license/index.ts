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
import { Asset } from '../asset/asset';
import jsPDF from 'jspdf';

export class OnChainLicenseModule {
  async createSmartLicense(
    input: ICreateSmartLicense,
    address: `0x${string}`,
    provider?: 'pinata' | 'filebase'
  ) {
    if (
      input.isRoyaltyAllowed &&
      (input.royaltyPercentage === undefined || input.royaltyPercentage === null)
    ) {
      throw new Error('Royalty percentage is required for smart licenses');
    }
    if (
      input.isExpirable &&
      (input.licenseExpiryTimestamp === undefined || input.licenseExpiryTimestamp === null)
    ) {
      throw new Error('Expiry timestamp is required for smart licenses');
    }
    const { encodedData, signature } = await generateSignature(address);
    const licenseData = await this.createLicensePDF(input, address, provider);
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
        input.licenseExpiryTimestamp ?? 0,
        input.royaltyPercentage ?? 0,
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
      result: {
        ...topics.args,
        licenseMetaDataURI: licenseURI,
        licenseMetaDataCID: licenseData?.licenseCid,
      },
    };
  }

  async createCustomLicense(
    input: ICreateCustomLicense,
    address: `0x${string}`,
    provider?: 'pinata' | 'filebase'
  ) {
    if (
      input.isRoyaltyAllowed &&
      (input.royaltyPercentage === undefined || input.royaltyPercentage === null)
    ) {
      throw new Error('Royalty percentage is required for smart licenses');
    }
    if (
      input.isExpirable &&
      (input.licenseExpiryTimestamp === undefined || input.licenseExpiryTimestamp === null)
    ) {
      throw new Error('Expiry timestamp is required for smart licenses');
    }
    const { encodedData, signature } = await generateSignature(address);
    const licenseData = await this.createLicensePDF(input, address, provider);
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
        input.licenseExpiryTimestamp ?? 0,
        input.royaltyPercentage ?? 0,
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
      result: {
        ...topics.args,
        licenseMetaDataURI: licenseURI,
        licenseMetaDataCID: licenseData?.licenseCid,
      },
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

  async updateSmartLicense(input: IAttachLicense, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: licenseModuleAbi,
      address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
      functionName: 'updateSmartLicenseEncoded',
      args: [input.ipId, input.licenseTermId, encodedData, signature],
    });
    const transactionResponse = await waitForTransactionReceipt(getConfig()!, { hash: data });

    return { transactionResponse, result: true };
  }

  async updateCustomLicense(input: IAttachLicense, address: `0x${string}`) {
    const { encodedData, signature } = await generateSignature(address);

    const data = await writeContract(getConfig()!, {
      abi: licenseModuleAbi,
      address: getContractAddresses().LICENSE_CONTRACT_ADDRESS,
      functionName: 'updateCustomLicenseEncoded',
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
    keys: ICreateCustomLicense | ICreateSmartLicense,
    address: `0x${string}`,
    provider: 'pinata' | 'filebase' = 'pinata'
  ) => {
    try {
      const licenseFile = await this.generateKORProtocolLicensePDF(keys, address);
      const asset = new Asset();
      const { ipfsHash } = await asset.uploadAssetToIpfs(licenseFile, provider, {
        disableISCC: true,
      });
      const PIL = {
        isRoyaltyAllowed: keys.isRoyaltyAllowed,
        isCommercialUseAllowed: keys.isCommercialUseAllowed,
        isExpirable: keys.isExpirable,
        isDerivativeAllowed: keys.isDerivativeAllowed,
        licenseFee: keys.licenseFee,
      };
      const customTerms = (keys as ICreateCustomLicense).customKeys;
      const { metaDataHash } = await asset.uploadMetaDataToIpfs(
        {
          name: 'KOR_Protocol_License',
          PIL,
          customTerms,
          licenseURI: `ipfs://${ipfsHash}`,
        },
        provider
      );
      return { licenseCid: metaDataHash };
    } catch (error) {
      throw new Error((error as { message: string }).message ?? 'Failed to create license PDF');
    }
  };

  private readonly generateKORProtocolLicensePDF = async (
    licenseData: ICreateCustomLicense | ICreateSmartLicense,
    address: `0x${string}`
  ): Promise<File> => {
    const doc = new jsPDF({ format: 'a4' });
    const response = await fetch(`${getApiUrl()}/license/license-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
      body: JSON.stringify({ ...licenseData, senderWalletAddress: address }),
    });
    const responseHTML = await response.json();
    const htmlContent = responseHTML.templateHtml;

    // Use doc.html to render the HTML directly to PDF
    return new Promise<File>((resolve) => {
      doc.html(htmlContent, {
        callback: (doc) => {
          const blob = doc.output('blob');
          const file = new File([blob], 'KOR_Protocol_License.pdf', { type: 'application/pdf' });
          resolve(file);
        },
        x: 10,
        y: 10,
        width: 190, // Set width to fit A4 page width, adjusting as necessary
        windowWidth: 800, // Base width of your HTML template
      });
    });
  };
}
