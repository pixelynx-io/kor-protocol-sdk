import {
  ICreateCollection,
  ICreateIPCollection,
  IMintFromCollection,
  IMintFromProtocolCollection,
  IMintIPFromIPCollection,
  IRegisterDerivative,
  IRegisterNFT,
} from '../types';
import { Asset } from './asset/asset';
import { IPModule } from './ip-module';
import { NFTModule } from './nft-module';

export class Base extends Asset {
  private readonly nftModule: NFTModule;
  private readonly ipModule: IPModule;
  constructor() {
    super();
    this.nftModule = new NFTModule();
    this.ipModule = new IPModule();
  }

  createCollection = async (data: ICreateCollection) => {
    return await this.nftModule.createCollection(data);
  };

  createIPCollection = async (data: ICreateIPCollection) => {
    return await this.nftModule.createIPCollection(data);
  };

  mintFromCollection = async (data: IMintFromCollection) => {
    return await this.nftModule.mintFromCollection(data);
  };

  mintFromProtocolCollection = async (data: IMintFromProtocolCollection) => {
    return await this.nftModule.mintFromProtocolCollection(data);
  };

  mintIPFromIPCollection = async (data: IMintIPFromIPCollection) => {
    return await this.nftModule.mintIPFromIPCollection(data);
  };

  registerNFTCollection = async (data: IRegisterNFT) => {
    return await this.ipModule.registerNFT(data);
  };

  registerDerivates = async (data: IRegisterDerivative) => {
    return await this.ipModule.registerDerivates(data);
  };
}
