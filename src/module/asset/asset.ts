import { IAssetUploadResponse, IMetaDataType } from '../../types';

export class Asset {
  uploadAssetToIpfs(
    file: File,
    metaData?: IMetaDataType,
    provider?: 'pinata' | 'filebase',
    folderId?: string
  ): Promise<IAssetUploadResponse>;
  uploadAssetToIpfs(
    file: FileList,
    metaData?: IMetaDataType[],
    provider?: 'pinata' | 'filebase',
    folderId?: string
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
    metaData?: IMetaDataType | IMetaDataType[],
    provider: 'pinata' | 'filebase' = 'pinata',
    folderId: string = ''
  ): Promise<IAssetUploadResponse> {
    if (file instanceof File && Array.isArray(metaData)) {
      throw new Error('Metadata should be of type object instead of array');
    }
    if (file instanceof FileList && metaData && metaData.length !== file.length) {
      throw new Error('Metadata length should match with file array');
    }
    if (file instanceof File && !Array.isArray(metaData)) {
      return await this.uploadFileToProvider(provider, file, metaData, folderId);
    }
    if (
      file instanceof FileList &&
      (!metaData || (Array.isArray(metaData) && metaData.length === file.length))
    ) {
      return await this.uploadFolderToProvider(file, metaData, provider);
    } else {
      throw new Error('File param is mandatory to call uploadAssetToIpfs');
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
      if (url) {
        const myHeaders = new Headers({ 'Content-Type': file.type });
        await fetch(url, {
          method: 'PUT',
          headers: myHeaders,
          body: file,
        });
        return url;
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        (error as { message: string }).message || 'Some error occured while uploading file'
      );
    }
  }

  // createFolder(folderName: string, isMetaData: boolean): Promise<string>;
  createFolder(
    folderName: string,
    isMetaData: boolean
  ): Promise<{
    folderId: string;
  }>;

  async createFolder(folderName: string, isMetaData: boolean) {
    if (!folderName) {
      throw new Error('Name should be provided to create a new folder');
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/asset/create_folder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderName, isMetaData }),
      });

      const json = await res.json();
      const { folderId } = json;
      return { folderId };
    } catch (error) {
      throw new Error((error as { message: string }).message || 'Error while creating folder');
    }
  }

  async generateFolderCID(folderId: string): Promise<IAssetUploadResponse> {
    if (!folderId) {
      throw new Error('Folder id should be provided to create a new folder');
    }
    try {
      const res = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/asset/generate_folder_cid`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ folderId }),
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/asset/generate_folder_cid`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ folderId: `${folderId}-metadata` }),
        }),
      ]);

      const json = await Promise.all(res.map(async (resItem) => await resItem.json()));
      return {
        ipfsHash: json[0]?.cid ?? undefined,
        metaDataHash: json[1]?.cid ?? undefined,
      };
    } catch (error) {
      throw new Error((error as { message: string }).message || 'Error while creating folder');
    }
  }

  private async uploadFileToProvider(
    providerName: 'pinata' | 'filebase',
    file: File,
    metaData?: IMetaDataType,
    folderId: string = ''
  ) {
    let ipfsHash = '';
    let metaDataHash: string | undefined = undefined;
    if (providerName === 'pinata') {
      ipfsHash = await this.uploadAssetToPinata(file);
      metaDataHash = await this.uploadMetaDataToPinataIpfs(metaData, ipfsHash);
      return { ipfsHash, metaDataHash: metaDataHash };
    } else {
      ipfsHash = await this.uploadAssetToFilebase(file, folderId);
      metaDataHash = await this.uploadMetaDataToFilebaseIpfs(
        metaData,
        ipfsHash,
        folderId ? `${folderId}-metadata` : ''
      );
      return { ipfsHash, metaDataHash: metaDataHash };
    }
  }

  private async uploadFolderToProvider(
    file: FileList,
    metaData?: IMetaDataType[],
    providerName: 'pinata' | 'filebase' = 'pinata'
  ) {
    let ipfsHash = '';
    let metaDataHash: string | undefined = undefined;
    if (providerName === 'pinata') {
      ipfsHash = await this.uploadAssetFolderToIpfs(file);
      if (Array.isArray(metaData)) {
        metaDataHash = await this.uploadFolderMetaDataToPinataIpfs(metaData, ipfsHash);
      }
    } else {
      const { cid, folderId } = await this.uploadAssetFolderToFilebase(file);
      ipfsHash = cid;
      if (Array.isArray(metaData)) {
        metaDataHash = await this.uploadFolderMetaDataToFilebaseIpfs(metaData, ipfsHash, folderId);
      }
    }

    return { ipfsHash, metaDataHash };
  }

  /**
   * Function to upload folder meta data
   *
   * @private
   * @param {IMetaDataType[]} metaData
   * @param {string} ipfsHash
   * @memberof Asset
   */
  private uploadFolderMetaDataToPinataIpfs = async (
    metaData: IMetaDataType[],
    ipfsHash: string
  ) => {
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
      const jwtRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/asset/generate_key`, {
        method: 'POST',
      });
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

  private uploadFolderMetaDataToFilebaseIpfs = async (
    metaData: IMetaDataType[],
    ipfsHash: string,
    folderId: string
  ) => {
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
        formData.append(
          'folderName',
          `${folderId?.split('-')?.length > 2 ? folderId.split('-')[2] : ''}-meta-data-folder`
        );
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/asset/upload_folder_to_filebase`,
        {
          method: 'POST',
          headers: {},
          body: formData,
        }
      );

      const json = await res.json();
      const { cid } = json;

      return cid;
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * function to upload meta data to pinata ipfs
   *
   * @private
   * @param {IMetaDataType} [metaData]
   * @param {string} [ipfsHash]
   * @memberof Asset
   */
  private uploadMetaDataToPinataIpfs = async (metaData?: IMetaDataType, ipfsHash?: string) => {
    try {
      if (metaData && ipfsHash) {
        const jwtRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/asset/generate_key`, {
          method: 'POST',
        });
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

  private uploadMetaDataToFilebaseIpfs = async (
    metaData?: IMetaDataType,
    ipfsHash?: string,
    folderId = ''
  ) => {
    try {
      if (metaData && ipfsHash) {
        const formData = new FormData();
        const blob = new Blob(
          [JSON.stringify({ ...metaData, image: `ipfs://${ipfsHash}` }, null, 2)],
          {
            type: 'application/json',
          }
        );

        const file = new File([blob], `${ipfsHash}`, { type: 'application/json' });
        formData.append('folderId', folderId);
        formData.append('file', file);
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/asset/upload_files_to_filebase`,
          {
            method: 'POST',
            headers: {
              // 'Content-Type': 'application/json',
            },
            body: formData,
          }
        );

        const json = await res.json();
        const { cid } = json;
        return cid;
      }
    } catch (error) {
      return error;
    }
  };

  /**
   * upload asset to sdk's pinata account
   *
   * @param {File} file
   * @memberof Asset
   */
  private uploadAssetToPinata = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const jwtRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/asset/generate_key`, {
        method: 'POST',
      });
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

  private uploadAssetToFilebase = async (file: File, folderId = '') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', folderId || '');
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/asset/upload_files_to_filebase`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const json = await res.json();
      const { cid } = json;

      return cid;
    } catch (e) {
      throw new Error((e as { message: string }).message || 'Unable to upload file');
    }
  };

  private uploadAssetFolderToIpfs = async (files: FileList) => {
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
      const jwtRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/asset/generate_key`, {
        method: 'POST',
      });
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

  private uploadAssetFolderToFilebase = async (files: FileList) => {
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
      formData.append(
        'folderName',
        files[0].webkitRelativePath.substring(0, files[0].webkitRelativePath.lastIndexOf('/') + 1)
      );

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/asset/upload_folder_to_filebase`,
        {
          method: 'POST',
          headers: {},
          body: formData,
        }
      );

      const json = await res.json();
      const { cid, folderId } = json;

      return { cid, folderId };
    } catch (e) {
      throw new Error((e as { message: string }).message || 'Unable to upload file');
    }
  };
}
