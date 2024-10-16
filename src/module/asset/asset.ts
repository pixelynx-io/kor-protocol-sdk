import { MemoryBlockStore } from 'ipfs-car/blockstore/memory';
import { packToBlob } from 'ipfs-car/pack/blob';

import { IAssetOptions, IAssetUploadResponse, IMetaDataType } from '../../types';
import { getKey } from '../../main';
import { getApiUrl } from '../../utils';

export class Asset {
  uploadAssetToIpfs(
    file: File,
    provider?: 'pinata' | 'filebase',
    options?: IAssetOptions
  ): Promise<IAssetUploadResponse>;
  uploadAssetToIpfs(
    file: FileList,
    provider?: 'pinata' | 'filebase',
    options?: IAssetOptions
  ): Promise<IAssetUploadResponse>;

  /**
   * Upload asset to ipfs, provide file object for single file.
   * For multiple file pass list of files as an argument
   *
   * @param {(File | File[])} file
   * @memberof Asset
   */
  async uploadAssetToIpfs(
    file: File | FileList,
    provider: 'pinata' | 'filebase' = 'pinata',
    options?: IAssetOptions
  ): Promise<IAssetUploadResponse> {
    if (file instanceof File) {
      const data = await this.uploadFileToProvider(provider, file, options);
      this.generateISCC([
        { assetUrl: `https://ipfs.io/ipfs/${data.ipfsHash}`, size: file.size, fileName: file.name },
      ]);
      return data;
    }
    if (file instanceof FileList) {
      return await this.uploadFolderToProvider(file, provider, options);
    } else {
      throw new Error('File param is mandatory to call uploadAssetToIpfs');
    }
  }

  uploadMetaDataToIpfs(
    metaData: IMetaDataType,
    provider: 'pinata' | 'filebase',
    options?: IAssetOptions
  ): Promise<{ metaDataHash: string }>;

  uploadMetaDataToIpfs(
    metaData: IMetaDataType[],
    provider: 'pinata' | 'filebase',
    options?: IAssetOptions
  ): Promise<{ metaDataHash: string }>;

  async uploadMetaDataToIpfs(
    metaData: IMetaDataType | IMetaDataType[],
    provider: 'pinata' | 'filebase',
    options?: IAssetOptions
  ): Promise<{ metaDataHash: string }> {
    let metaDataHash = '';
    if (provider === 'pinata') {
      if (!Array.isArray(metaData)) {
        metaDataHash = await this.uploadMetaDataToPinataIpfs(metaData);
      } else {
        metaDataHash = await this.uploadFolderMetaDataToPinataIpfs(metaData);
      }
    } else if (provider === 'filebase') {
      if (!Array.isArray(metaData)) {
        metaDataHash = await this.uploadMetaDataToFilebaseIpfs(metaData, options);
      } else {
        metaDataHash = await this.uploadFolderMetaDataToFilebaseIpfs(metaData, options);
      }
    }
    return { metaDataHash };
  }

  uploadAssetToURL(file: File, url: string): Promise<string>;

  /**
   * Function to upload file to custom backend
   *
   * @param {File} file
   * @param {string} url presigned url to upload file on
   * @return {*}
   * @memberof Asset
   */
  async uploadAssetToURL(file: File, url: string) {
    try {
      if (url) {
        const myHeaders = new Headers({ 'Content-Type': file.type });
        await fetch(url, {
          method: 'PUT',
          headers: myHeaders,
          body: file,
        });
        const uploadedURL = `${new URL(url).origin}${new URL(url).pathname}`;
        return uploadedURL;
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        (error as { message: string }).message || 'Some error occured while uploading file'
      );
    }
  }

  createBucket(bucketName: string): Promise<{
    folderId: string;
  }>;

  async createBucket(bucketName: string) {
    if (!bucketName) {
      throw new Error('Bucket name should be provided to create a new bucket');
    }
    try {
      const res = await fetch(`${getApiUrl()}/asset/filebase/create-bucket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': getKey(),
        },
        body: JSON.stringify({ bucketName }),
      });

      const json = await res.json();
      const { folderId } = json;
      return { folderId };
    } catch (error) {
      throw new Error((error as { message: string }).message || 'Error while creating folder');
    }
  }

  async pinFolderToFilebaseIpfs(bucketName?: string): Promise<IAssetUploadResponse> {
    if (!bucketName) {
      throw new Error('Bucket name should be provided to pin folder to ipfs');
    }
    try {
      const res = await fetch(`${getApiUrl()}/asset/filebase/generate-bucket-cid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': getKey(),
        },
        body: JSON.stringify({ bucketName }),
      });

      const json = await res.json();
      return {
        ipfsHash: json?.cid ?? undefined,
      };
    } catch (error) {
      throw new Error((error as { message: string })?.message || 'Error while creating folder');
    }
  }

  private async uploadAssetToFilebase(file: File, options?: IAssetOptions) {
    try {
      const headers = new Headers({ 'Content-Type': file.type });
      const response = await fetch(`${getApiUrl()}/asset/filebase/generate-signed-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
        body: JSON.stringify({
          fileName: file.name,
          bucketName: options?.bucketName ?? '',
          folderName: options?.folderName ?? '',
          totalUploadSize: file.size,
          totalFileCount: 1,
        }),
      });
      let ipfsHash = '';
      if (response.ok) {
        const signedUrlResponse = await response.json();
        const pinResponse = await fetch(signedUrlResponse.signedUrl, {
          method: 'PUT',
          headers,
          body: file,
        });
        ipfsHash =
          (pinResponse as unknown as { headers: Headers })?.headers?.get('X-Amz-Meta-Cid') ?? '';
      } else {
        const signedUrlResponse = await response.json();
        throw new Error(`${signedUrlResponse?.message}: unable to generate presigned url`);
      }
      return ipfsHash;
    } catch (error) {
      throw new Error((error as { message: string })?.message || 'Error while uploading file');
    }
  }

  private async uploadAssetFolderToFilebaseIpfs(files: FileList, options?: IAssetOptions) {
    try {
      const fileArray: File[] = [];
      Array.from(files).forEach((file) => {
        fileArray.push(file);
      });

      const ipfsHash = await Promise.all(
        fileArray.map(async (fileItem) => {
          const presignedUrl = await fetch(`${getApiUrl()}/asset/filebase/generate-signed-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
            body: JSON.stringify({
              fileName: fileItem.name,
              bucketName: options?.bucketName ?? '',
              folderName: options?.folderName ?? '',
              totalUploadSize: fileItem.size,
              totalFileCount: 1,
            }),
          });
          if (presignedUrl.ok) {
            const signedUrlResponse = await presignedUrl.json();
            const pinResponse = await fetch(signedUrlResponse.signedUrl, {
              method: 'PUT',
              headers: { 'Content-Type': fileItem.type },
              body: fileItem,
            });
            return (
              (pinResponse as unknown as { headers: Headers }).headers.get('x-amz-meta-cid') ?? ''
            );
          } else {
            const signedUrlResponse = await presignedUrl.json();
            throw new Error(`${signedUrlResponse?.message}: unable to generate presigned url`);
          }
        })
      );

      return ipfsHash;
    } catch (error) {
      throw new Error((error as { message: string })?.message || 'Error while uploading file');
    }
  }

  private readonly carCompressor = async (files: File[]) => {
    const formattedFiles = files.map((file) => ({
      path: encodeURIComponent(file.name),
      content: file,
    }));
    const { car } = await packToBlob({
      input: formattedFiles,
      blockstore: new MemoryBlockStore(),
      wrapWithDirectory: true,
    });

    return car;
  };

  private async uploadFileToProvider(
    providerName: 'pinata' | 'filebase',
    file: File,
    options?: IAssetOptions
  ) {
    let ipfsHash = '';
    if (providerName === 'pinata') {
      ipfsHash = await this.uploadAssetToPinata(file);
      return { ipfsHash };
    } else {
      ipfsHash = await this.uploadAssetToFilebase(file, options);
      return { ipfsHash };
    }
  }

  private async uploadFolderToProvider(
    file: FileList,
    providerName: 'pinata' | 'filebase' = 'pinata',
    options?: IAssetOptions
  ) {
    let ipfsHash: string | string[] = '';
    if (providerName === 'pinata') {
      ipfsHash = await this.uploadAssetFolderToPinataIpfs(file);
      const isccData = Array.from(file).map((fileItem) => ({
        assetUrl: `https://ipfs.io/ipfs/${ipfsHash}/${fileItem.name}`,
        size: fileItem.size,
        fileName: fileItem.name,
      }));
      this.generateISCC(isccData);
    } else {
      ipfsHash = await this.uploadAssetFolderToFilebaseIpfs(file, options);
      const isccData = Array.from(file).map((fileItem) => ({
        assetUrl: `https://ipfs.io/ipfs/${ipfsHash}`,
        size: fileItem.size,
        fileName: fileItem.name,
      }));
      this.generateISCC(isccData);
    }

    return { ipfsHash };
  }

  /**
   * Function to upload folder meta data
   *
   * @private
   * @param {IMetaDataType[]} metaData
   * @param {string} ipfsHash
   * @memberof Asset
   */
  private async uploadFolderMetaDataToPinataIpfs(metaData: IMetaDataType[]) {
    try {
      const formData = new FormData();
      let totalUploadSize = 0;
      metaData.forEach((metaDataItem, index) => {
        const blob = new Blob([JSON.stringify({ ...metaDataItem }, null, 2)], {
          type: 'application/json',
        });

        const file = new File([blob], `ipfsHash/${index}`, { type: 'application/json' });

        formData.append('file', file);
        totalUploadSize += file.size;
      });

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);
      const jwtRes = await fetch(`${getApiUrl()}/asset/pinata/generate-jwt`, {
        method: 'POST',
        body: JSON.stringify({ totalUploadSize, totalFileCount: metaData.length }),
        headers: { 'api-key': getKey(), 'Content-Type': 'application/json' },
      });

      if (jwtRes.ok) {
        const JWT = await jwtRes.json();

        const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${JWT.jwt}`,
          },
          body: formData,
        });

        const json = await res.json();
        const { IpfsHash } = json;
        return IpfsHash;
      } else {
        const JWT = await jwtRes.json();
        throw new Error(`${JWT?.message}: unable to generate jwt`);
      }
    } catch (error) {
      console.error(error);
      throw new Error((error as { message: string })?.message ?? 'Something went wrong');
    }
  }

  private async uploadFolderMetaDataToFilebaseIpfs(
    metaData: IMetaDataType[],
    options?: IAssetOptions
  ) {
    try {
      const fileArray: File[] = [];
      metaData.forEach((metaDataItem, index) => {
        const blob = new Blob([JSON.stringify({ ...metaDataItem }, null, 2)], {
          type: 'application/json',
        });

        const file = new File([blob], `${index}`, {
          type: 'application/json',
        });
        fileArray.push(file);
      });

      const carFile = await this.carCompressor(fileArray);
      const response = await fetch(`${getApiUrl()}/asset/filebase/generate-signed-url`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-amz-meta-import': 'car',
          'api-key': getKey(),
        },
        body: JSON.stringify({
          fileName: `${options?.folderName ?? 'metadata'}.car`,
          folderName: options?.folderName,
          bucketName: options?.bucketName,
          totalUploadSize: carFile.size,
          totalFileCount: 1,
        }),
      });
      let ipfsHash = '';

      if (response.ok) {
        const signedUrlResponse = await response.json();

        const pinResponse = await fetch(signedUrlResponse.signedUrl, {
          method: 'PUT',
          headers: { 'content-type': 'application/vnd.ipld.car', 'x-amz-meta-import': 'car' },
          body: carFile,
        });

        ipfsHash =
          (pinResponse as unknown as { headers: Headers })?.headers?.get('x-amz-meta-cid') ?? '';
      } else {
        const signedUrlResponse = await response.json();
        throw new Error(`${signedUrlResponse.message}: unable to generate presigned url`);
      }
      return ipfsHash;
    } catch (error) {
      throw new Error((error as { message: string })?.message ?? 'Something went wrong');
    }
  }

  /**
   * function to upload meta data to pinata ipfs
   *
   * @private
   * @param {IMetaDataType} [metaData]
   * @param {string} [ipfsHash]
   * @memberof Asset
   */
  private readonly uploadMetaDataToPinataIpfs = async (
    metaData: IMetaDataType
  ): Promise<string> => {
    try {
      if (metaData) {
        const jwtRes = await fetch(`${getApiUrl()}/asset/pinata/generate-jwt`, {
          method: 'POST',
          body: JSON.stringify({
            totalUploadSize: new TextEncoder().encode(JSON.stringify(metaData)).length,
            totalFileCount: 1,
          }),
          headers: { 'api-key': getKey(), 'Content-Type': 'application/json' },
        });
        const JWT = await jwtRes.json();
        if (!jwtRes.ok) {
          throw new Error(`${JWT.message}: unable to generate jwt`);
        }

        const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JWT.jwt}`,
          },
          body: JSON.stringify({
            pinataContent: { ...metaData },
            pinataMetadata: { ...metaData },
          }),
        });

        const json = await res.json();
        const { IpfsHash } = json;
        return IpfsHash;
      } else {
        throw new Error('Meta data can not be undefined');
      }
    } catch (error) {
      throw new Error((error as { message: string })?.message ?? 'Something went wrong');
    }
  };

  private readonly uploadMetaDataToFilebaseIpfs = async (
    metaData: IMetaDataType,
    options?: IAssetOptions
  ) => {
    try {
      if (metaData) {
        const blob = new Blob([JSON.stringify({ ...metaData }, null, 2)], {
          type: 'application/json',
        });

        const file = new File([blob], `${Date.now()}-metadata`, { type: 'application/json' });
        let ipfsHash = '';
        const headers = new Headers({ 'Content-Type': file.type });
        const response = await fetch(`${getApiUrl()}/asset/filebase/generate-signed-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': getKey() },
          body: JSON.stringify({
            fileName: file.name,
            bucketName: options?.bucketName,
            folderName: options?.folderName,
            totalUploadSize: file.size,
            totalFileCount: 1,
          }),
        });
        if (response.ok) {
          const signedUrlResponse = await response.json();
          const pinResponse = await fetch(signedUrlResponse.signedUrl, {
            method: 'PUT',
            headers,
            body: file,
          });
          ipfsHash =
            (pinResponse as unknown as { headers: Headers }).headers.get('X-Amz-Meta-Cid') ?? '';
        } else {
          const signedUrlResponse = await response.json();
          throw new Error(`${signedUrlResponse.message}: unable to generate presigned url`);
        }
        return ipfsHash;
      } else {
        throw new Error('Meta data can not be undefined');
      }
    } catch (error) {
      throw new Error((error as { message: string }).message ?? 'Something went wrong');
    }
  };

  /**
   * upload asset to sdk's pinata account
   *
   * @param {File} file
   * @memberof Asset
   */
  private readonly uploadAssetToPinata = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const jwtRes = await fetch(`${getApiUrl()}/asset/pinata/generate-jwt`, {
        method: 'POST',
        body: JSON.stringify({ totalUploadSize: file.size, totalFileCount: 1 }),
        headers: { 'api-key': getKey(), 'Content-Type': 'application/json' },
      });

      const JWT = await jwtRes.json();
      if (!jwtRes.ok) {
        throw new Error(`${JWT?.message}: unable to generate jwt`);
      }

      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${JWT.jwt}`,
        },
        body: formData,
      });

      const json = await res.json();
      const { IpfsHash } = json;
      return IpfsHash;
    } catch (e) {
      throw new Error((e as { message: string })?.message || 'Unable to upload file');
    }
  };

  private readonly uploadAssetFolderToPinataIpfs = async (files: FileList): Promise<string> => {
    try {
      const formData = new FormData();
      let totalUploadSize = 0;
      Array.from(files).forEach((file, index) => {
        const directoryPath = file.webkitRelativePath
          ? file.webkitRelativePath.substring(0, file.webkitRelativePath.lastIndexOf('/') + 1)
          : '/';
        const updatedFile = new File([file], `${directoryPath}/${index}`, {
          type: file.type,
          lastModified: file.lastModified,
        });
        formData.append('file', updatedFile);
        totalUploadSize += updatedFile.size;
      });
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);
      const jwtRes = await fetch(`${getApiUrl()}/asset/pinata/generate-jwt`, {
        method: 'POST',
        body: JSON.stringify({ totalUploadSize, totalFileCount: files.length }),
        headers: { 'api-key': getKey(), 'Content-Type': 'application/json' },
      });

      if (jwtRes.ok) {
        const JWT = await jwtRes.json();

        const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${JWT.jwt}`,
          },
          body: formData,
        });

        const json = await res.json();
        const { IpfsHash } = json;

        return IpfsHash;
      } else {
        const JWT = await jwtRes.json();
        throw new Error(`${JWT.message}: unable to generate jwt`);
      }
    } catch (e) {
      throw new Error((e as { message: string })?.message || 'Unable to upload file');
    }
  };

  private readonly generateISCC = async (
    data: {
      assetUrl: string;
      fileName: string;
      folderId?: number;
      size: number;
    }[],
    folderId?: number
  ) => {
    try {
      const generateISCC = await fetch(`${getApiUrl()}/iscc/generate-iscc`, {
        method: 'POST',
        body: JSON.stringify({
          files: [...data],
          folderId,
        }),
        headers: { 'api-key': getKey(), 'Content-Type': 'application/json' },
      });
      if (!generateISCC.ok) {
        console.warn('Unable to generate iscc for the code');
      }
    } catch (error) {
      console.warn(error);
    }
  };
}
