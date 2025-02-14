import { hexToBytes, keccak256, bytesToBigInt, bytesToHex, numberToBytes } from 'viem';
import pkg from 'lodash';
import blst from './blst/blst';
const { zip } = pkg;
import { Blst, P1, P2, PT } from './blst/types';

const blsSubgroupOrderBytes = [
    0x73, 0xed, 0xa7, 0x53, 0x29, 0x9d, 0x7d, 0x48, 0x33, 0x39, 0xd8, 0x08, 0x09, 0xa1, 0xd8, 0x05,
    0x53, 0xbd, 0xa4, 0x02, 0xff, 0xfe, 0x5b, 0xfe, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00, 0x00, 0x01,
];

const blsSubgroupOrder = bytesToBigInt(Uint8Array.from(blsSubgroupOrderBytes));

async function ensureBlstInitialized(): Promise<void> {
    return new Promise((resolve) => {
        if (blst.runtimeInitialized) {
            console.log("blst.runtimeInitialized")
            resolve();
        } else {
            console.log("Waiting for BLST runtime to initialize...");
            blst.onRuntimeInitialized = () => {
                console.log("BLST runtime initialized.");
                resolve();
            };
        }
    });
}

export async function encryptData(
    msgHex: `0x${string}`,
    identityPreimageHex: `0x${string}`,
    eonKeyHex: `0x${string}`,
    sigmaHex: `0x${string}`,
) {
    await ensureBlstInitialized(); // Ensure WASM is ready
    const identity = await computeIdentityP1(identityPreimageHex);
    const eonKey = await computeEonKeyP2(eonKeyHex);
    const encryptedMessage = await encrypt(msgHex, identity, eonKey, sigmaHex);
    const encodedTx = encodeEncryptedMessage(encryptedMessage);
    return encodedTx;
}

export async function computeIdentityP1(preimage: `0x${string}`): Promise<P1> {
    const preimageBytes = hexToBytes(('0x1' + preimage.slice(2)) as `0x${string}`);
    const identity = new blst.P1().hash_to(
        preimageBytes,
        'SHUTTER_V01_BLS12381G1_XMD:SHA-256_SSWU_RO_',
        null,
    );
    return identity;
}

async function computeEonKeyP2(eonKeyHex: `0x${string}`): Promise<P2> {
    const eonKey = new blst.P2(hexToBytes(eonKeyHex));
    return eonKey;
}

async function encrypt(msgHex: `0x${string}`, identity: P1, eonKey: P2, sigmaHex: `0x${string}`) {
    const r = computeR(sigmaHex.slice(2), msgHex.slice(2));
    const c1 = computeC1(r);
    const c2 = await computeC2(sigmaHex, r, identity, eonKey);
    const c3 = computeC3(
        padAndSplit(hexToBytes(msgHex as `0x${string}`)),
        hexToBytes(sigmaHex as `0x${string}`),
    );

    return {
        VersionId: 0x3,
        c1: c1,
        c2: c2,
        c3: c3,
    };
}

export function encodeEncryptedMessage(encryptedMessage: any): `0x${string}` {
    const c1Length = 96;
    const c2Length = 32;
    const c3Length = encryptedMessage.c3.length * 32;

    const totalLength = 1 + c1Length + c2Length + c3Length;
    const bytes = new Uint8Array(totalLength);

    bytes[0] = encryptedMessage.VersionId;
    bytes.set(encryptedMessage.c1, 1);
    bytes.set(encryptedMessage.c2, 1 + c1Length);
    encryptedMessage.c3.forEach((block: ArrayLike<number>, i: number) => {
        const offset = 1 + c1Length + c2Length + 32 * i;
        bytes.set(block, offset);
    });

    return bytesToHex(bytes);
}

//======================================
function computeR(sigmaHex: string, msgHex: string): bigint {
    const preimage = sigmaHex + msgHex;
    return hash3(preimage);
}

function computeC1(r: bigint) {
    const scalar = new blst.Scalar().from_bendian(numberToBytes(r)).to_lendian();
    const c1 = blst.P2.generator().mult(scalar).compress();
    return c1;
}

async function computeC2(sigmaHex: string, r: bigint, identity: P1, eonKey: P2): Promise<any> {
    const p: PT = new blst.PT(identity, eonKey);
    const preimage = await GTExp(p, r);
    const key = hash2(preimage);
    console.log("sigmaHex length", hexToBytes(sigmaHex as `0x${string}`).length, "key", key.length)
    const result = xorBlocks(hexToBytes(sigmaHex as `0x${string}`), key);
    return result;
}

function computeC3(messageBlocks: Uint8Array[], sigma: Uint8Array): Uint8Array[] {
    const keys = computeBlockKeys(sigma, messageBlocks.length);

    return zip(keys, messageBlocks).map(([key, block]) => {
        if (key === undefined || block === undefined) {
            throw new Error('Key or block is undefined');
        }
        return xorBlocks(key, block);
    });
}


//======================================
function hash2(p: PT): Uint8Array {
    const finalExp = p.final_exp().to_bendian();
    const result = new Uint8Array(finalExp.length + 1);
    result[0] = 0x2;
    result.set(finalExp, 1);
    return keccak256(result, 'bytes');
}

function hash3(bytesHex: string): bigint {
    const preimage = hexToBytes(('0x3' + bytesHex) as `0x${string}`);
    const hash = keccak256(preimage, 'bytes');
    const bigIntHash = bytesToBigInt(hash);
    const result = bigIntHash % blsSubgroupOrder;
    return result;
}

function hash4(bytes: Uint8Array): Uint8Array {
    const preimage = new Uint8Array(bytes.length + 1);
    preimage[0] = 0x4;
    preimage.set(bytes, 1);
    const hash = keccak256(preimage, 'bytes');
    return hash;
}

//======================================
function xorBlocks(x: Uint8Array, y: Uint8Array): Uint8Array {
    if (x.length !== y.length) {
        throw new Error('Both byte arrays must be of the same length.');
    }

    const result = new Uint8Array(x.length);
    for (let i = 0; i < x.length; i++) {
        result[i] = x[i] ^ y[i];
    }
    return result;
}

function computeBlockKeys(sigma: Uint8Array, n: number): Uint8Array[] {
    return Array.from({ length: n }, (_, x) => {
        const suffix = Buffer.alloc(4);
        suffix.writeUInt32BE(x, 0);
        let suffixLength = 4;
        for (let i = 0; i < 3; i++) {
            if (suffix[i] !== 0) break;
            suffixLength--;
        }
        const effectiveSuffix = Buffer.from(suffix.slice(4 - suffixLength));
        const preimage = Buffer.concat([sigma, effectiveSuffix]);
        return hash4(preimage);
    });
}

function padAndSplit(bytes: Uint8Array): Uint8Array[] {
    const blockSize = 32;
    const paddingLength = blockSize - (bytes.length % blockSize);
    const padded = new Uint8Array(bytes.length + paddingLength);
    padded.set(bytes);
    padded.fill(paddingLength, bytes.length);
    const result: Uint8Array[] = [];
    for (let i = 0; i < padded.length; i += blockSize) {
        result.push(padded.slice(i, i + blockSize));
    }
    return result;
}

async function GTExp(x: PT, exp: bigint): Promise<PT> {
    const a: PT = x;
    const acc: PT = blst.PT.one();

    while (exp > BigInt(0)) {
        if (exp & BigInt(1)) {
            acc.mul(a);
        }
        a.sqr();
        exp >>= BigInt(1);
    }

    return acc;
}