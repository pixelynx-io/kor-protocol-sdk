export type IMetaDataType = { [key: string]: string | number | object | boolean | Array<unknown> };

export interface IAssetUploadResponse {
  ipfsHash: string;
  metaDataHash?: string;
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
  baseTokenURI: string;
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
}

export interface IRegisterNFTCollection extends IContractWriteBase {
  tokenContract: WalletAddress;
  tokenId: number;
  licensors: [WalletAddress, WalletAddress, WalletAddress];
}

export interface IRegisterDerivative extends IContractWriteBase {
  tokenContract: WalletAddress;
  tokenId: number;
  parentIP: string;
}
