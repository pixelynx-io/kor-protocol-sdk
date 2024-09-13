import { IAssetUploadResponse, IFolderData, IMetaDataType } from '../../types';

export class Asset {
  uploadAssetToIpfs(file: File, metaData?: IMetaDataType): Promise<IAssetUploadResponse>;
  uploadAssetToIpfs(file: FileList, metaData?: IMetaDataType[]): Promise<IAssetUploadResponse>;

  /**
   * Upload asset to ipfs, provide file object for single file.
   * For multiple file pass list of files as an argument
   *
   * @param {(File | File[])} file
   * @memberof Asset
   */
  async uploadAssetToIpfs(
    file: File | FileList,
    metaData?: IMetaDataType | IMetaDataType[]
  ): Promise<IAssetUploadResponse> {
    try {
      let ipfsHash = '';
      let metaDataHash: string | undefined = undefined;
      if (file instanceof File && !Array.isArray(metaData)) {
        ipfsHash = await this.uploadAsset(file);
        metaDataHash = await this.uploadMetaDataToIpfs(metaData, ipfsHash);
        return { ipfsHash, metaDataHash: metaDataHash };
      }
      if (
        file instanceof FileList &&
        (!metaData || (Array.isArray(metaData) && metaData.length === file.length))
      ) {
        ipfsHash = await this.uploadAssetFolder(file);
        if (Array.isArray(metaData)) {
          metaDataHash = await this.uploadFolderMetaData(metaData, ipfsHash);
        }
      } else {
        throw new Error('Meta data array length is not equal to file length');
      }

      return { ipfsHash, metaDataHash };
    } catch (error) {
      console.error(error);
      return { ipfsHash: '' };
    }
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
      const preSignedUrlResponse = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });
      const presignedUrl = await preSignedUrlResponse.json();
      if (presignedUrl) {
        const myHeaders = new Headers({ 'Content-Type': file.type });
        await fetch(presignedUrl.signedUrl, {
          method: 'PUT',
          headers: myHeaders,
          body: file,
        });
        return presignedUrl?.signedUrl?.split('?')[0];
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        (error as { message: string }).message || 'Some error occured while uploading file'
      );
    }
  }

  uploadFilesToIpfs(
    files: FileList,
    metaData?: IMetaDataType[]
  ): Promise<IFolderData[] | undefined>;

  async uploadFilesToIpfs(
    files: FileList,
    metaData?: IMetaDataType[]
  ): Promise<IFolderData[] | undefined> {
    if (files instanceof FileList && (!metaData || metaData?.length === files.length)) {
      const fileObjects = await Promise.all(
        Array.from(files).map(async (file, index) => {
          const { ipfsHash, metaDataHash } = await this.uploadAssetToIpfs(
            file,
            metaData && metaData?.length > index ? metaData[index] : undefined
          );
          return { ipfsHash, metaDataHash, fileName: file.name };
        })
      );
      return fileObjects;
    }
  }

  async pinFolderToIpfs(name: string, data: IFolderData[]) {
    const jwtRes = await fetch('http://localhost:3000/asset/generate_key', { method: 'POST' });
    const JWT = await jwtRes.json();

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JWT.jwt}`,
      },
      body: JSON.stringify({
        name,
        data,
      }),
    });

    const json = await res.json();
    const { IpfsHash } = json;
    return IpfsHash;
  }

  /**
   * Function to upload folder meta data
   *
   * @private
   * @param {IMetaDataType[]} metaData
   * @param {string} ipfsHash
   * @memberof Asset
   */
  private uploadFolderMetaData = async (metaData: IMetaDataType[], ipfsHash: string) => {
    try {
      const formData = new FormData();
      metaData.forEach((metaDataItem, index) => {
        const blob = new Blob(
          [JSON.stringify({ ...metaDataItem, image: `ipfs://${ipfsHash}/${index}` }, null, 2)],
          {
            type: 'application/json',
          }
        );

        const file = new File([blob], `${ipfsHash}/${index}`, { type: 'application/json' });

        formData.append('file', file);
      });

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);
      const jwtRes = await fetch('http://localhost:3000/asset/generate_key', { method: 'POST' });
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
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * function to upload meta data to ipfs
   *
   * @private
   * @param {IMetaDataType} [metaData]
   * @param {string} [ipfsHash]
   * @memberof Asset
   */
  private uploadMetaDataToIpfs = async (metaData?: IMetaDataType, ipfsHash?: string) => {
    try {
      if (metaData && ipfsHash) {
        const jwtRes = await fetch('http://localhost:3000/asset/generate_key', { method: 'POST' });
        const JWT = await jwtRes.json();

        const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JWT.jwt}`,
          },
          body: JSON.stringify({
            pinataContent: { ...metaData, image: `ipfs://${ipfsHash}` },
            pinataMetadata: { ...metaData, image: `ipfs://${ipfsHash}` },
          }),
        });

        const json = await res.json();
        const { IpfsHash } = json;
        return IpfsHash;
      }
    } catch (error) {
      return error;
    }
  };

  /**
   * upload asset to sdk's account
   *
   * @param {File} file
   * @memberof Asset
   */
  private uploadAsset = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const jwtRes = await fetch('http://localhost:3000/asset/generate_key', { method: 'POST' });
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
    } catch (e) {
      throw new Error((e as { message: string }).message || 'Unable to upload file');
    }
  };

  private uploadAssetFolder = async (files: FileList) => {
    try {
      const formData = new FormData();

      Array.from(files).forEach((file, index) => {
        const directoryPath = file.webkitRelativePath.substring(
          0,
          file.webkitRelativePath.lastIndexOf('/') + 1
        );
        const updatedFile = new File([file], `${directoryPath}/${index}`, {
          type: file.type,
          lastModified: file.lastModified,
        });
        formData.append('file', updatedFile);
      });
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);
      const jwtRes = await fetch('http://localhost:3000/asset/generate_key', { method: 'POST' });
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
    } catch (e) {
      throw new Error((e as { message: string }).message || 'Unable to upload file');
    }
  };
}
