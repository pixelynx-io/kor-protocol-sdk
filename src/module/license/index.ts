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
import autoTable from 'jspdf-autotable';

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
      result: { ...topics.args, licenseURI: licenseURI },
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
    provider?: 'pinata' | 'filebase'
  ) => {
    try {
      const licenseFile = await this.generateKORProtocolLicensePDF(keys);
      const asset = new Asset();
      const { ipfsHash } = await asset.uploadAssetToIpfs(licenseFile, provider, {
        disableISCC: true,
      });
      return { licenseCid: ipfsHash };
    } catch (error) {
      throw new Error((error as { message: string }).message ?? 'Failed to create license PDF');
    }
  };

  private readonly generateKORProtocolLicensePDF = async (
    licenseData: ICreateCustomLicense | ICreateSmartLicense
  ) => {
    const doc = new jsPDF();

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`KOR Protocol License Terms`, 105, 30, { align: 'left' });

    // Section for License Owner
    const ownerDetails = [
      ['Type', 'Smart'],
      ['Address', '0x040782e297b247BFad1C8A0601f6B146F0AC4433'],
      ['License Fee', '0.0001 ETH'],
    ];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('License Owner', 15, 30);

    // Create License Owner table
    autoTable(doc, {
      startY: 65,
      head: [['Field', 'Value']],
      body: ownerDetails,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: '#0d1c38', textColor: '#ffffff' }, // Light gray header
    });

    // Section for License Information
    const licenseInfo = [
      ['Royalty Allowed', licenseData.isRoyaltyAllowed ? 'Permitted' : 'Not Permitted'],
      ['Commercial Usage', licenseData.isCommercialUseAllowed ? 'Authorized' : 'Prohibited'],
      ['Expiration Status', licenseData.isExpirable ? 'Expirable' : 'Non-Expirable'],
      ['Derivative Work', licenseData.isDerivativeAllowed ? 'Permitted' : 'Not Permitted'],
      ['License Fee', `${licenseData.licenseFee} ETH`],
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const licenseInfoStartY = (doc as any).lastAutoTable.finalY + 10; // Space between tables
    doc.text('KOR Protocol License Terms', 15, licenseInfoStartY);

    // Create License Information table
    autoTable(doc, {
      startY: licenseInfoStartY + 5,
      head: [['Field', 'Value']],
      body: licenseInfo,
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: '#0d1c38', textColor: '#ffffff' },
    });

    // Section for Custom Keys, if any
    const customKeys = Object.entries((licenseData as ICreateCustomLicense).customKeys || {}).map(
      ([key, value]) => [key, value]
    );

    if (customKeys.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customKeysStartY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Custom License Terms', 15, customKeysStartY);

      // Create Custom Keys table
      autoTable(doc, {
        startY: customKeysStartY + 5,
        head: [['Key', 'Value']],
        body: customKeys,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 10 },
        headStyles: { fillColor: '#0d1c38', textColor: '#ffffff' },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const footerY = (doc as any).lastAutoTable
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc as any).lastAutoTable.finalY + 20
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc as any).autoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text('This document is issued under the KOR Protocol License Terms.', 105, footerY, {
      align: 'center',
    });

    const blob = doc.output('blob');
    const file = new File([blob], 'KOR_Protocol_License.pdf', { type: 'application/pdf' });
    return file;
  };
}
