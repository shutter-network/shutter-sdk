# Shutter SDK

## Description

This is the Shutter SDK for the Shutter Network. It is a TypeScript library that provides functions for encrypting and decrypting data using the Shutter Network's encryption protocol.

## Installation

```bash
npm install @shutter-network/shutter-sdk
```

## Encryption

```ts
import { encryptData } from "@shutter-network/shutter-sdk";

const encryptedData = await encryptData(
    msgHex,
    identityPreimageHex,
    eonKeyHex,
    sigmaHex
);  
``` 

## Decryption

```ts
import { decrypt } from "@shutter-network/shutter-sdk";

const decryptedData = await decrypt(encryptedData, epochSecretKeyHex);
```

## Test

```bash
npm run test
```

## Build

```bash
npm run build
```

## Support

Feel free to open an issue on GitHub
