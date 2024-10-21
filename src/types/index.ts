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
  licenseTermID: number;
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
}

export type KorChain = typeof baseSepolia.id;
