export type IMetaDataType = { [key: string]: string | number | object | boolean | Array<unknown> };

export interface IAssetUploadResponse {
  ipfsHash: string;
  metaDataHash?: string;
}
