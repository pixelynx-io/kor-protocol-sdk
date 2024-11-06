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
    const { address } = await checkValidChainAndWallet();
    return await this.nftModule.createCollection(data, address);
  };

  createIPCollection = async (data: ICreateIPCollection) => {
    const { address } = await checkValidChainAndWallet();
    return await this.nftModule.createIPCollection(data, address);
  };

  mintFromCollection = async (data: IMintFromCollection) => {
    const { address } = await checkValidChainAndWallet();
    return await this.nftModule.mintFromCollection(data, address);
  };

  mintFromProtocolCollection = async (data: IMintFromProtocolCollection) => {
    const { address } = await checkValidChainAndWallet();
    return await this.nftModule.mintFromProtocolCollection(data, address);
  };

  mintIPFromIPCollection = async (data: IMintIPFromIPCollection) => {
    const { address } = await checkValidChainAndWallet();
    return await this.nftModule.mintIPFromIPCollection(data, address);
  };

  registerNFT = async (data: IRegisterNFT) => {
    const { address } = await checkValidChainAndWallet();
    return await this.ipModule.registerNFT(data, address);
  };

  registerDerivates = async (data: IRegisterDerivative) => {
    const { address } = await checkValidChainAndWallet();
    return await this.ipModule.registerDerivates(data, address);
  };
}
