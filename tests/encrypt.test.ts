import { Hex, stringToHex } from "viem";
import { encryptData } from "../src/crypto/crypto"

describe("Crypto: encrypt functions", () => {
    it("should encrypt correctly", async () => {
        const randomHex = randomBytes(33)
        const sigmaHex = randomHex as Hex
        const identityPrefixHex = "0xb77b16a748604c8c37a882a8f739cc8fdb51d0ba6b1dd9d6a0e3a87db8a5ce7f97d8c4809abe1787273c1c2c90ba8928"
        const eonKeyHex = "0xadc82882285a02537b519d3145a751120962888d7ca71130c5bb1a5044dcdf78111f64e5fec59aa4f7e499d397854e5b169b5e452f2c30d546f5dadddaa5fd002b344338d74bb6dbc50281018c770f438443326f4dd621e82d10e42539b898f7"

        const msgHex = stringToHex("hide this message")
        const encryptedData = await encryptData(msgHex, identityPrefixHex, eonKeyHex, sigmaHex)
        expect(encryptedData.length).toBeGreaterThan(0)
    });
});

function randomBytes(size: number) {
    const array = new Uint8Array(size);
    crypto.getRandomValues(array);

    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}