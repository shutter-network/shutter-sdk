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

const msgHex = "0x1c";
const eonKeyHex = "0x8b36251faf28be849a2ca9212ae7ceeb6b6848d58a3d5d77e1629c9d7ebdee3dad594c6af6b66e7a6e4b27e54778b8fd1491868c2938c93285be79168c0210d632a2a553f6b03940dd08312d32ea718e0f8c4488f39e6f34e27add4506631ddb";
const identityPreimageHex = "0x8c4e6301fba207fb2375d2fda9f2ebe1142d07d1954d871e2d71b3d93534380793b99fb184f7526012a49ac1a22300fac22dc1d7";
const sigmaHex = "0x312c10b186086d502ba683cffc2ae650d53b508904b3c430df8e7d5aa336c0f5";

// Call encryptData function
const encryptedData = await encryptData(msgHex, eonKeyHex, identityPreimageHex, sigmaHex);
console.log("Encryption successful:", encryptedData);
``` 

## Decryption

```ts
import { decrypt } from "@shutter-network/shutter-sdk";

const encryptedData = "0x03a975256b0098bc981da31762a73e50a07c79f5bf3e17c44121b9567033cedaf9e203f0300b709dec3458a88baa18963c0e503f437bff7adb31231941585ea1bb14e8ce98c7dc1471666e4b07c592cbeda30acc22f23dcb84d58d41848e72af0804d348d5c5cb65a52dc3b697ea4caae9679b97e395a30807f9657ebc85bbf2fcadaa9a458a86bffb78dde89f7626a26eb84f4781d3b6759c06629ea321a8b757"
const epochSecretKeyHex = "0x81cfcfceebfc69b3cb3fe074f4b3751e7844f6d62b3040563ccb3a2430110f259d109519c73682735f4c02651492c740"

// Call decrypt function
const decryptedData = await decrypt(encryptedData, epochSecretKeyHex);
console.log("Decryption successful:", decryptedData);
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
