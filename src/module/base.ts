import {
  IActivateRoyalty,
  IAttachLicense,
  ICancelConflict,
  ICollectRevenue,
  ICreateCollection,
  ICreateCustomLicense,
  ICreateExternalLicense,
  ICreateIPCollection,
  ICreateSmartLicense,
  IMintFromCollection,
  IMintFromProtocolCollection,
  IMintIPFromIPCollection,
  IPayRoyalty,
  IRaiseConflict,
  IRegisterDerivative,
  IRegisterNFT,
  IResolveConflict,
} from '../types';
import { Asset } from './asset/asset';
import { OnChainIPModule } from './ip-module';
import { NFTModule } from './nft-module';
import { checkValidChainAndWallet } from '../utils';
import { OnChainLicenseModule } from './license';
import { RoyaltyDistributionModule } from './royalty-distribution';
import { ConflictModule } from './conflict-module';

export class Base extends Asset {
  private readonly nftModule: NFTModule;
  private readonly ipModule: OnChainIPModule;
  private readonly licenseModule: OnChainLicenseModule;
  private readonly royaltyDistributionModule: RoyaltyDistributionModule;
  private readonly conflictModule: ConflictModule;
  constructor() {
    super();
    this.nftModule = new NFTModule();
    this.ipModule = new OnChainIPModule();
    this.licenseModule = new OnChainLicenseModule();
    this.royaltyDistributionModule = new RoyaltyDistributionModule();
    this.conflictModule = new ConflictModule();
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

  createSmartLicense = async (data: ICreateSmartLicense, provider?: 'pinata' | 'filebase') => {
    const { address } = await checkValidChainAndWallet();
    return await this.licenseModule.createSmartLicense(data, address, provider);
  };

  createCustomLicense = async (data: ICreateCustomLicense, provider?: 'pinata' | 'filebase') => {
    const { address } = await checkValidChainAndWallet();
    return await this.licenseModule.createCustomLicense(data, address, provider);
  };

  createExternalLicense = async (data: ICreateExternalLicense) => {
    const { address } = await checkValidChainAndWallet();
    return await this.licenseModule.createExternalLicense(data, address);
  };

  attachSmartLicense = async (data: IAttachLicense) => {
    const { address } = await checkValidChainAndWallet();
    return await this.licenseModule.attachSmartLicense(data, address);
  };

  attachCustomLicense = async (data: IAttachLicense) => {
    const { address } = await checkValidChainAndWallet();
    return await this.licenseModule.attachCustomLicense(data, address);
  };

  attachExternalLicense = async (data: IAttachLicense) => {
    const { address } = await checkValidChainAndWallet();
    return await this.licenseModule.attachExternalLicense(data, address);
  };

  updateSmartLicense = async (data: IAttachLicense) => {
    const { address } = await checkValidChainAndWallet();
    return await this.licenseModule.updateSmartLicense(data, address);
  };

  updateCustomLicense = async (data: IAttachLicense) => {
    const { address } = await checkValidChainAndWallet();
    return await this.licenseModule.updateCustomLicense(data, address);
  };

  getLicenseFee = async (parentIP: `0x${string}`) => {
    await checkValidChainAndWallet();
    return await this.ipModule.getLicenseFee(parentIP);
  };

  activateRoyalty = async (data: IActivateRoyalty) => {
    const { address } = await checkValidChainAndWallet();
    return await this.royaltyDistributionModule.activateRoyalty(data, address);
  };

  payRoyalty = async (data: IPayRoyalty) => {
    const { address } = await checkValidChainAndWallet();
    return await this.royaltyDistributionModule.payRoyalty(data, address);
  };

  collectRevenue = async (data: ICollectRevenue) => {
    const { address } = await checkValidChainAndWallet();
    return await this.royaltyDistributionModule.collectRevenue(data, address);
  };

  raiseConflict = async (data: IRaiseConflict) => {
    const { address } = await checkValidChainAndWallet();
    return await this.conflictModule.raiseConflict(data, address);
  };

  resolveConflict = async (data: IResolveConflict) => {
    const { address } = await checkValidChainAndWallet();
    return await this.conflictModule.resolveConflict(data, address);
  };

  cancelConflict = async (data: ICancelConflict) => {
    const { address } = await checkValidChainAndWallet();
    return await this.conflictModule.cancelConflict(data, address);
  };
}
