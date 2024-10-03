# Typescript utility library

# KOR Protocol SDK release/v0.0.3 Release Notes

## Notable Functions

1. `uploadAssetToIpfs`: Upload and pin assets to ipfs
2. `createFolder`: Creates a folder by name
3. `generateCID`: Generate ipfs hash for the folder
4. `mintFromCollection`: Mints NFT from collection
5. `registerNFT`: Register an individual NFT as an IP

## New Features and Improvements

1. **Asset Module**:

   - Added utility to upload large folders to ipfs
   - Create methods to create and generate folder cid
   - Added filebase as an asset provider

2. **NFT Module**:

   - Added function to create NFT collection
   - Added function to mint NFT from collection

3. **IP Module Integration**:

   - Added method to register NFT as an IP

4. **Improved Error Handling**:

   - Added more specific require statements for better error reporting.
