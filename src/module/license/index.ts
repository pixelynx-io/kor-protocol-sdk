import { waitForTransactionReceipt, writeContract } from '@wagmi/core';
import { getConfig } from '../../main';
import {
  IAttachLicense,
  ICreateCustomLicense,
  ICreateExternalLicense,
  ICreateSmartLicense,
} from '../../types';
import { decodeEventLog, parseUnits } from 'viem';
import { generateSignature, getContractAddresses } from '../../utils';
import { licenseModuleAbi } from '../../abis/license-module';
import { Asset } from '../asset/asset';
import jsPDF from 'jspdf';

export class OnChainLicenseModule {
  async createSmartLicense(
    input: ICreateSmartLicense,
    address: `0x${string}`,
    provider?: 'pinata' | 'filebase'
  ) {
    const { encodedData, signature } = await generateSignature(address);
    const licenseData = await this.createLicensePDF(input, provider);
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
    const { encodedData, signature } = await generateSignature(address);
    const licenseData = await this.createLicensePDF(input, provider);
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
    provider: 'pinata' | 'filebase' = 'pinata'
  ) => {
    try {
      const licenseFile = await this.generateKORProtocolLicensePDF(keys);
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
          licenseURI: `https://ipfs.io/ipfs/${ipfsHash}`,
        },
        provider
      );
      return { licenseCid: metaDataHash };
    } catch (error) {
      throw new Error((error as { message: string }).message ?? 'Failed to create license PDF');
    }
  };

  private readonly generateKORProtocolLicensePDF = async (
    licenseData: ICreateCustomLicense | ICreateSmartLicense
  ): Promise<File> => {
    const doc = new jsPDF({ format: 'a4' });

    // Define the HTML content as a template
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h1 style="text-align: center; font-size: 24px; font-weight: bold;">KOR Protocol License</h1>

      <h3 style="font-size: 18px; color: #333; font-weight: bold;">License Owner</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><th style="background-color: #0d1c38;color: #ffffff; border:1px solid grey; padding: 5px 20px; text-align: left; border-collapse: collapse;">Field</th><th style="background-color: #0d1c38;color: #ffffff; padding: 5px 20px; text-align: left; border-collapse: collapse;">Value</th></tr>
        <tr><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">Type</td><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">Smart</td></tr>
        <tr><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">Address</td><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">0x040782e297b247BFad1C8A0601f6B146F0AC4433</td></tr>
        <tr><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">License Fee</td><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">0.0001 ETH</td></tr>
      </table>

      <h3 style="font-size: 18px; color: #333; margin-top: 20px; font-weight: bold;">KOR Protocol License Terms</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><th style="background-color: #0d1c38;color: #ffffff; border:1px solid grey; padding: 5px 20px; text-align: left; border-collapse: collapse;">Field</th><th style="background-color: #0d1c38;color: #ffffff; padding: 5px 20px; text-align: left; border-collapse: collapse;">Value</th></tr>
        <tr><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">Royalty Allowed</td><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">${licenseData.isRoyaltyAllowed ? 'Yes' : 'No'}</td></tr>
        <tr><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">Commercial Use Allowed</td><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">${licenseData.isCommercialUseAllowed ? 'Yes' : 'No'}</td></tr>
        <tr><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">Expirable</td><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">${licenseData.isExpirable ? 'Yes' : 'No'}</td></tr>
        <tr><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">Derivative Allowed</td><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">${licenseData.isDerivativeAllowed ? 'Yes' : 'No'}</td></tr>
        <tr><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">License Fee</td><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">${licenseData.licenseFee}</td></tr>
      </table>
      ${
        (licenseData as ICreateCustomLicense).customKeys
          ? ` <div id='custom-keys-header'>
      <h3 style="font-size: 18px; color: #333; margin-top: 20px; font-weight: bold;">Custom License Terms</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><th style="background-color: #0d1c38;color: #ffffff;border:1px solid grey; padding: 5px 20px; text-align: left; border-collapse: collapse;">Key</th><th style="background-color: #0d1c38;color: #ffffff; padding: 5px 20px; text-align: left; border-collapse: collapse;">Value</th></tr>
        ${Object.entries((licenseData as ICreateCustomLicense).customKeys ?? [])
          .map(
            ([key, value]) =>
              `<tr><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">${key}</td><td style="border:1px solid grey; padding: 5px 20px; border-collapse: collapse;">${value}</td></tr>`
          )
          .join('')}
      </table>
    </div>`
          : ''
      }
      <p style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
        This document is issued under the KOR Protocol License Terms.
      </p>
    </div>
  `;

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
