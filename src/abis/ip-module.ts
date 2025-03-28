export const ipModuleABI = [
  { inputs: [], name: 'AccessControlBadConfirmation', type: 'error' },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'bytes32', name: 'neededRole', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
    type: 'error',
  },
  { inputs: [], name: 'EnforcedPause', type: 'error' },
  { inputs: [], name: 'ExpectedPause', type: 'error' },
  { inputs: [], name: 'IPAlreadyRegistered', type: 'error' },
  { inputs: [], name: 'IncorrectLicenseFee', type: 'error' },
  { inputs: [], name: 'InvalidInitialization', type: 'error' },
  { inputs: [], name: 'InvalidSignature', type: 'error' },
  { inputs: [], name: 'InvalidToken', type: 'error' },
  { inputs: [], name: 'NotInitializing', type: 'error' },
  { inputs: [], name: 'ReentrancyGuardReentrantCall', type: 'error' },
  { inputs: [], name: 'SignatureExpired', type: 'error' },
  { inputs: [], name: 'Unauthorized', type: 'error' },
  { inputs: [], name: 'UnsupportedInterface', type: 'error' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'ipId', type: 'address' },
      { indexed: true, internalType: 'address', name: 'parentIp', type: 'address' },
      { indexed: true, internalType: 'address', name: 'tokenContract', type: 'address' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'uri', type: 'string' },
      { indexed: false, internalType: 'uint64', name: 'registrationTimestamp', type: 'uint64' },
    ],
    name: 'DerivativeIPRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'implementation', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'chainId', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'tokenContract', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'IPAccountRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'ipId', type: 'address' },
      { indexed: true, internalType: 'string', name: 'name', type: 'string' },
      { indexed: true, internalType: 'address', name: 'tokenContract', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'uri', type: 'string' },
      { indexed: false, internalType: 'uint64', name: 'registrationTimestamp', type: 'uint64' },
      { indexed: false, internalType: 'address[3]', name: 'licensors', type: 'address[3]' },
    ],
    name: 'IPAssetRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'ipId', type: 'address' },
      { indexed: true, internalType: 'address', name: 'mintingCollection', type: 'address' },
      { indexed: true, internalType: 'address', name: 'owner', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'mintPrice', type: 'uint256' },
    ],
    name: 'IPMintingCollectionDeployed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'ipId', type: 'address' },
      { indexed: true, internalType: 'address', name: 'mintingCollection', type: 'address' },
      { indexed: true, internalType: 'address', name: 'recipient', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'IPNftMinted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint64', name: 'version', type: 'uint64' }],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'previousAdminRole', type: 'bytes32' },
      { indexed: true, internalType: 'bytes32', name: 'newAdminRole', type: 'bytes32' },
    ],
    name: 'RoleAdminChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'RoleGranted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { indexed: true, internalType: 'address', name: 'account', type: 'address' },
      { indexed: true, internalType: 'address', name: 'sender', type: 'address' },
    ],
    name: 'RoleRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }],
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ERC6551_PUBLIC_REGISTRY',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'IP_ACCOUNT_IMPL',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'IP_ACCOUNT_SALT',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      { internalType: 'address', name: 'recipient', type: 'address' },
    ],
    name: 'buyIpNft',
    outputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getIPAccountImpl',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'ipId', type: 'address' }],
    name: 'getIPAsset',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'uri', type: 'string' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'address', name: 'parentIp', type: 'address' },
          { internalType: 'address', name: 'royaltyVault', type: 'address' },
          { internalType: 'address[3]', name: 'licensors', type: 'address[3]' },
          { internalType: 'address', name: 'tokenContract', type: 'address' },
          { internalType: 'address', name: 'mintingCollection', type: 'address' },
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
          { internalType: 'uint256', name: 'registrationTimestamp', type: 'uint256' },
          { internalType: 'bool', name: 'isParent', type: 'bool' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
          { internalType: 'bool', name: 'licenseAttached', type: 'bool' },
        ],
        internalType: 'struct IStruct.IPAsset',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'ipId', type: 'address' }],
    name: 'getIPCollection',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'uri', type: 'string' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'address', name: 'royaltyVault', type: 'address' },
          { internalType: 'address[3]', name: 'licensors', type: 'address[3]' },
          { internalType: 'address', name: 'ipCollectionAddress', type: 'address' },
          { internalType: 'address', name: 'collectionTokenAddress', type: 'address' },
          { internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
          { internalType: 'uint256', name: 'collectionTokenId', type: 'uint256' },
          { internalType: 'uint256', name: 'registrationTimestamp', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct IStruct.IPCollection',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'ipId', type: 'address' }],
    name: 'getIpMintPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'admin', type: 'address' },
      { internalType: 'address', name: 'signer', type: 'address' },
      { internalType: 'address', name: 'erc6551Registry', type: 'address' },
      { internalType: 'address', name: 'ipAccountImpl', type: 'address' },
      { internalType: 'address', name: 'addressManager_', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'chainId', type: 'uint256' },
      { internalType: 'address', name: 'tokenContract', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'ipAccount',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'ipId', type: 'address' }],
    name: 'isIPActive',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'ipId', type: 'address' }],
    name: 'ownerOfIP',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'collectionAddress', type: 'address' },
      { internalType: 'address', name: 'collectionTokenAddress', type: 'address' },
      { internalType: 'uint256', name: 'collectionTokenId', type: 'uint256' },
      { internalType: 'address[3]', name: 'licensors', type: 'address[3]' },
    ],
    name: 'registerCollection',
    outputs: [{ internalType: 'address', name: 'ipId', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenContract', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'address', name: 'parentIP', type: 'address' },
      { internalType: 'bool', name: 'isMintAllowed', type: 'bool' },
      { internalType: 'bool', name: 'isUnlimitedSupply', type: 'bool' },
      { internalType: 'uint256', name: 'ipSupply', type: 'uint256' },
      { internalType: 'uint256', name: 'mintPrice', type: 'uint256' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'registerDerivativeEncoded',
    outputs: [{ internalType: 'address', name: 'ipId', type: 'address' }],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'tokenContract', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { internalType: 'address[3]', name: 'licensors', type: 'address[3]' },
      { internalType: 'bool', name: 'isMintAllowed', type: 'bool' },
      { internalType: 'bool', name: 'isUnlimitedSupply', type: 'bool' },
      { internalType: 'uint256', name: 'ipSupply', type: 'uint256' },
      { internalType: 'uint256', name: 'mintPrice', type: 'uint256' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'registerNFTEncoded',
    outputs: [{ internalType: 'address', name: 'ipId', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'callerConfirmation', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'role', type: 'bytes32' },
      { internalType: 'address', name: 'account', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      {
        components: [
          { internalType: 'string', name: 'uri', type: 'string' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'address', name: 'parentIp', type: 'address' },
          { internalType: 'address', name: 'royaltyVault', type: 'address' },
          { internalType: 'address[3]', name: 'licensors', type: 'address[3]' },
          { internalType: 'address', name: 'tokenContract', type: 'address' },
          { internalType: 'address', name: 'mintingCollection', type: 'address' },
          { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
          { internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
          { internalType: 'uint256', name: 'registrationTimestamp', type: 'uint256' },
          { internalType: 'bool', name: 'isParent', type: 'bool' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
          { internalType: 'bool', name: 'licenseAttached', type: 'bool' },
        ],
        internalType: 'struct IStruct.IPAsset',
        name: 'ipAsset',
        type: 'tuple',
      },
    ],
    name: 'setIPAsset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      {
        components: [
          { internalType: 'string', name: 'uri', type: 'string' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'address', name: 'royaltyVault', type: 'address' },
          { internalType: 'address[3]', name: 'licensors', type: 'address[3]' },
          { internalType: 'address', name: 'ipCollectionAddress', type: 'address' },
          { internalType: 'address', name: 'collectionTokenAddress', type: 'address' },
          { internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
          { internalType: 'uint256', name: 'collectionTokenId', type: 'uint256' },
          { internalType: 'uint256', name: 'registrationTimestamp', type: 'uint256' },
          { internalType: 'bool', name: 'isActive', type: 'bool' },
        ],
        internalType: 'struct IStruct.IPCollection',
        name: 'ipCollection',
        type: 'tuple',
      },
    ],
    name: 'setIPCollection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
];
