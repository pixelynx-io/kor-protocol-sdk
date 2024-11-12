export const licenseModuleAbi = [
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
  { inputs: [], name: 'FailedToAttachLicense', type: 'error' },
  { inputs: [], name: 'InvalidIPAddress', type: 'error' },
  { inputs: [], name: 'InvalidInitialization', type: 'error' },
  { inputs: [], name: 'InvalidLicenseTermId', type: 'error' },
  { inputs: [], name: 'InvalidLicenseType', type: 'error' },
  { inputs: [], name: 'InvalidLicensorAddress', type: 'error' },
  { inputs: [], name: 'InvalidSignature', type: 'error' },
  { inputs: [], name: 'LicenseAlreadyAttached', type: 'error' },
  { inputs: [], name: 'NotInitializing', type: 'error' },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'OwnableInvalidOwner',
    type: 'error',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
    type: 'error',
  },
  { inputs: [], name: 'ReentrancyGuardReentrantCall', type: 'error' },
  { inputs: [], name: 'SignatureExpired', type: 'error' },
  { inputs: [], name: 'Unauthorized', type: 'error' },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint64', name: 'version', type: 'uint64' }],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'uint256', name: 'licenseTermId', type: 'uint256' }],
    name: 'LicenseApproved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'ipId', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
    ],
    name: 'LicenseAttached',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'licenseType', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'licenseFees', type: 'uint256' },
    ],
    name: 'LicenseCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: 'uint256', name: 'licenseTermId', type: 'uint256' }],
    name: 'LicenseRejected',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'ipId', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
    ],
    name: 'LicenseUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'ipId', type: 'address' },
      { indexed: false, internalType: 'address[3]', name: 'newLicensors', type: 'address[3]' },
    ],
    name: 'LicensorsUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnershipTransferred',
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
    inputs: [{ internalType: 'uint256', name: 'licenseTermId', type: 'uint256' }],
    name: 'approveLicense',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      { internalType: 'uint256', name: 'customLicenseTermId', type: 'uint256' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'attachCustomLicenseEncoded',
    outputs: [{ internalType: 'bool', name: 'attached', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      { internalType: 'uint256', name: 'externalTermId', type: 'uint256' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'attachExternalLicenseEncoded',
    outputs: [{ internalType: 'bool', name: 'attached', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      { internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
    ],
    name: 'attachLicenseToDerivative',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      { internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'attachSmartLicenseEncoded',
    outputs: [{ internalType: 'bool', name: 'attached', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bool', name: 'isRoyaltyAllowed', type: 'bool' },
      { internalType: 'bool', name: 'isCommercialUseAllowed', type: 'bool' },
      { internalType: 'bool', name: 'isExpirable', type: 'bool' },
      { internalType: 'bool', name: 'isDervativeAllowed', type: 'bool' },
      { internalType: 'uint256', name: 'licenseFee', type: 'uint256' },
      { internalType: 'string', name: 'licenseURI', type: 'string' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'createCustomLicenseEncoded',
    outputs: [{ internalType: 'uint256', name: 'licenseTermId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'licenseURI', type: 'string' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'createExternalLicenseEncoded',
    outputs: [{ internalType: 'uint256', name: 'licenseTermId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bool', name: 'isRoyaltyAllowed', type: 'bool' },
      { internalType: 'bool', name: 'isCommercialUseAllowed', type: 'bool' },
      { internalType: 'bool', name: 'isExpirable', type: 'bool' },
      { internalType: 'bool', name: 'isDervativeAllowed', type: 'bool' },
      { internalType: 'uint256', name: 'licenseFee', type: 'uint256' },
      { internalType: 'string', name: 'licenseURI', type: 'string' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'createSmartLicenseEncoded',
    outputs: [{ internalType: 'uint256', name: 'licenseTermId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'licenseTermId', type: 'uint256' }],
    name: 'getLicense',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'licenseId', type: 'uint256' },
          { internalType: 'bool', name: 'isLicenseActive', type: 'bool' },
          { internalType: 'uint8', name: 'licenseType', type: 'uint8' },
          { internalType: 'bool', name: 'isRoyaltyAllowed', type: 'bool' },
          { internalType: 'bool', name: 'isCommercialUseAllowed', type: 'bool' },
          { internalType: 'bool', name: 'isExpirable', type: 'bool' },
          { internalType: 'bool', name: 'isDervativeAllowed', type: 'bool' },
          { internalType: 'uint256', name: 'licenseFee', type: 'uint256' },
          { internalType: 'address', name: 'createdBy', type: 'address' },
          { internalType: 'string', name: 'licenseURI', type: 'string' },
        ],
        internalType: 'struct IStruct.License',
        name: '',
        type: 'tuple',
      },
    ],
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
      { internalType: 'address', name: 'addressManager_', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'licenseTermId', type: 'uint256' }],
    name: 'isLicenseActive',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
      { internalType: 'address', name: 'licenseAttacher', type: 'address' },
    ],
    name: 'isLicenseAllowedforCollection',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'licenseTermID', type: 'uint256' }],
    name: 'rejectLicense',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
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
    inputs: [],
    name: 'setAddresses',
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
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      { internalType: 'uint256', name: 'customLicenseTermId', type: 'uint256' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'updateCustomLicenseEncoded',
    outputs: [{ internalType: 'bool', name: 'attached', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      { internalType: 'address[3]', name: 'newLicensors', type: 'address[3]' },
    ],
    name: 'updateLicensors',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'ipId', type: 'address' },
      { internalType: 'uint256', name: 'licenseTermId', type: 'uint256' },
      { internalType: 'bytes', name: 'encodedData', type: 'bytes' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'updateSmartLicenseEncoded',
    outputs: [{ internalType: 'bool', name: 'attached', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
