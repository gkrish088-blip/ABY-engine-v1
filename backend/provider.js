/**
 * Multi-chain Ethereum providers
 *
 * One provider per RPC URL (cached). Used for block listening and on-chain calls.
 * No blockchain reads in API routes; only this module and the indexer use providers.
 */
import { ethers } from "ethers";

/** @type {Map<string, ethers.JsonRpcProvider>} */
const providersByUrl = new Map();

/**
 * Get or create a provider for the given RPC URL.
 * @param {string} rpcUrl
 * @returns {ethers.JsonRpcProvider}
 */
export function getProviderForUrl(rpcUrl) {
  const key = rpcUrl.trim();
  let p = providersByUrl.get(key);
  if (!p) {
    p = new ethers.JsonRpcProvider(key);
    providersByUrl.set(key, p);
  }
  return p;
}

/**
 * Verify RPC is reachable. Throws if unreachable.
 * @param {string} rpcUrl
 * @returns {Promise<number>} Current block number
 */
export async function checkRpc(rpcUrl) {
  const p = getProviderForUrl(rpcUrl);
  const blockNumber = await p.getBlockNumber();
  return Number(blockNumber);
}

/**
 * Subscribe to new blocks for a given RPC. Callback receives (blockNumber, blockTimestamp).
 * Handler errors are logged; process is not exited.
 * @param {string} rpcUrl
 * @param {(blockNumber: number, blockTimestamp: number) => void | Promise<void>} onBlock
 * @returns {() => void} Unsubscribe function
 */
export function onBlock(rpcUrl, onBlock) {
  const p = getProviderForUrl(rpcUrl);
  const handler = async (blockNumber) => {
    try {
      const block = await p.getBlock(blockNumber);
      const timestamp = block?.timestamp ?? Math.floor(Date.now() / 1000);
      await onBlock(Number(blockNumber), timestamp);
    } catch (err) {
      console.error("[provider] block handler error:", err.message);
    }
  };
  p.on("block", handler);
  return () => {
    p.off("block", handler);
  };
}
