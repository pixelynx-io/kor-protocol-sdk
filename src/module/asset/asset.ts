import { IAssetUploadResponse, IMetaDataType } from '../../types';

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
      if (file instanceof File && (!metaData || !Array.isArray(metaData))) {
        ipfsHash = await this.uploadAsset(file);
        metaDataHash = await this.uploadMetaDataToIpfs(metaData, ipfsHash);
        return { ipfsHash, metaDataHash: metaDataHash };
      }
      if (file instanceof FileList) {
        ipfsHash = await this.uploadAssetFolder(file);
      }

      if (Array.isArray(metaData)) {
        metaDataHash = await this.uploadFolderMetaData(metaData, ipfsHash);
      }

      return { ipfsHash, metaDataHash };
    } catch (error) {
      console.error(error);
      return { ipfsHash: '' };
    }
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
