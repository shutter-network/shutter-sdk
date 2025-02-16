import { isBrowser, isNode } from "browser-or-node";

export let getBlst: () => Promise<any>;

if (isBrowser) {
    if (!window.blst) {
        throw new Error("BLST is not loaded in the browser. Ensure blst.js is included.");
    }
    getBlst = () => Promise.resolve(window.blst);
} else if (isNode) {
    getBlst = () => import('./blst/blst').then(module => module.default);
} else {
    throw new Error("platform not supported.");
}