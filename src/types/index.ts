import { baseSepolia } from '@wagmi/core/chains';

export type IMetaDataType = { [key: string]: string | number | object | boolean | Array<unknown> };

export interface IAssetUploadResponse {
  ipfsHash: string | string[];
}

export interface IFolderData extends IAssetUploadResponse {
  fileName: string;
}

export interface ICreateCollection extends IContractWriteBase {
  name: string;
  symbol: string;
}

type WalletAddress = `0x${string}`; // Ensures each string starts with '0x'

export interface ICreateIPCollection extends IContractWriteBase {
  name: string;
  symbol: string;
  mintPrice: number;
  maxSupply: number;
  licensors: [WalletAddress, WalletAddress, WalletAddress];
}

export interface IContractWriteBase {
  waitForTransaction?: boolean;
}

export interface IMintFromCollection extends IContractWriteBase {
  collectionAddress: WalletAddress;
  recipientAddress: WalletAddress;
  metadataURI: string;
}

export interface IMintFromProtocolCollection extends IContractWriteBase {
  recipientAddress: WalletAddress;
  metadataURI: string;
}

export interface IMintIPFromIPCollection extends IContractWriteBase {
  recipientAddress: WalletAddress;
  ipID: WalletAddress;
  uri: string;
}

export interface IRegisterNFT extends IContractWriteBase {
  tokenContract: WalletAddress;
  tokenId: number;
  licensors: [WalletAddress, WalletAddress, WalletAddress];
}

export interface IRegisterDerivative extends IContractWriteBase {
  tokenContract: WalletAddress;
  tokenId: number;
  parentIP: string;
}

export interface IAssetOptions {
  folderName?: string;
  bucketName?: string;
  disableISCC?: boolean;
}

export interface ICreateSmartLicense extends IContractWriteBase {
  isRoyaltyAllowed: boolean;
  isCommercialUseAllowed: boolean;
  isExpirable: boolean;
  isDerivativeAllowed: boolean;
  licenseFee: number;
  royaltyPercentage?: number;
  licenseExpiryTimestamp?: number;
}

export interface ICreateCustomLicense extends IContractWriteBase {
  isRoyaltyAllowed: boolean;
  isCommercialUseAllowed: boolean;
  isExpirable: boolean;
  isDerivativeAllowed: boolean;
  licenseFee: number;
  customKeys: { [key: string]: string | boolean };
  royaltyPercentage?: number;
  licenseExpiryTimestamp?: number;
}

export interface ICreateExternalLicense extends IContractWriteBase {
  licenseURI: string;
}

export interface IAttachLicense extends IContractWriteBase {
  ipId: `0x${string}`;
  licenseTermId: number;
}

export interface IActivateRoyalty {
  ip: `0x${string}`;
  royaltyTokenName: string;
  royaltyTokenSymbol: string;
  mintRTSupply: number;
}

export interface IPayRoyalty {
  ip: `0x${string}`;
  amount: number;
}

export interface ICollectRevenue {
  ip: `0x${string}`;
  snapshotId: number;
}

export interface IRaiseConflict {
  ip: `0x${string}`;
  evidenceLink: string;
  tier: number;
}

export interface IResolveConflict {
  conflictId: number;
  isValidConflict: boolean;
}
export interface ICancelConflict {
  conflictId: number;
}

export type KorChain = typeof baseSepolia.id;
