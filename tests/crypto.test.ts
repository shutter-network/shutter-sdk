import { Hex, stringToHex } from "viem";
import { decrypt, encryptData } from "../src/crypto/crypto"
import testData from "./test-data.json"

describe("Crypto functions", () => {
    it("should encrypt correctly", async () => {
        for (const test of testData) {
            if (test.name.includes("encryption")) {
                const { message, eon_public_key, epoch_id, sigma, expected } = test.test_data
                if (!message || !eon_public_key || !epoch_id || !sigma || !expected) {
                    throw new Error("Missing required fields in test data")
                }
                const encryptedData = await encryptData(message as Hex, epoch_id as Hex, eon_public_key as Hex, sigma as Hex)
                expect(encryptedData).toBe(expected)
            }
        }
    });

    it("should decrypt correctly", async () => {
        for (const test of testData) {
            if (test.name.includes("decryption")) {
                const { cipher, epoch_secret_key, expected } = test.test_data
                if (!cipher || !epoch_secret_key || !expected) {
                    throw new Error("Missing required fields in test data")
                }
                const decryptedData = await decrypt(cipher as Hex, epoch_secret_key as Hex)
                expect(decryptedData).toBe(expected)
            }
        }
    });
});