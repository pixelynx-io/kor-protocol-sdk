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
import { checkValidChainAndWallet } from '../utils';

export class Base extends Asset {
  private readonly nftModule: NFTModule;
  private readonly ipModule: IPModule;
  constructor() {
    super();
    this.nftModule = new NFTModule();
    this.ipModule = new IPModule();
  }

  createCollection = async (data: ICreateCollection) => {
    await checkValidChainAndWallet();
    return await this.nftModule.createCollection(data);
  };

  createIPCollection = async (data: ICreateIPCollection) => {
    await checkValidChainAndWallet();
    return await this.nftModule.createIPCollection(data);
  };

  mintFromCollection = async (data: IMintFromCollection) => {
    await checkValidChainAndWallet();
    return await this.nftModule.mintFromCollection(data);
  };

  mintFromProtocolCollection = async (data: IMintFromProtocolCollection) => {
    await checkValidChainAndWallet();
    return await this.nftModule.mintFromProtocolCollection(data);
  };

  mintIPFromIPCollection = async (data: IMintIPFromIPCollection) => {
    await checkValidChainAndWallet();
    return await this.nftModule.mintIPFromIPCollection(data);
  };

  registerNFT = async (data: IRegisterNFT) => {
    await checkValidChainAndWallet();
    return await this.ipModule.registerNFT(data);
  };

  registerDerivates = async (data: IRegisterDerivative) => {
    await checkValidChainAndWallet();
    return await this.ipModule.registerDerivates(data);
  };
}
