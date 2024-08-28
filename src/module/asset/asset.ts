export class Asset {
  uploadAssetToIpfs(file: File): Promise<string>;
  uploadAssetToIpfs(file: File[]): Promise<string>;

  /**
   * Upload asset to ipfs, provide file object for single file.
   * For multiple file pass list of files as an argument
   *
   * @param {(File | File[])} file
   * @memberof Asset
   */
  async uploadAssetToIpfs(file: File | File[]) {
    if (file instanceof File) {
      return await this.uploadAsset(file);
    }
    return await this.uploadAssetFolder(file);
  }

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
      const jwtRes = await fetch('http://localhost:3000/asset/generateKey', { method: 'POST' });
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

  private uploadAssetFolder = async (files: File[]) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('file', file);
      });
      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append('pinataOptions', options);
      const jwtRes = await fetch('http://localhost:3000/asset/generateKey', { method: 'POST' });
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
