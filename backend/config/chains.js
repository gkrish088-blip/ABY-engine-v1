/**
 * Multi-chain config for Aave v3
 *
 * RPC URLs and Pool addresses can be overridden via env:
 * - ETHEREUM_RPC_URL, POLYGON_RPC_URL, OPTIMISM_RPC_URL, ARBITRUM_RPC_URL
 * - ETHEREUM_POOL_ADDRESS, POLYGON_POOL_ADDRESS, OPTIMISM_POOL_ADDRESS, ARBITRUM_POOL_ADDRESS
 *
 * Asset addresses are the underlying reserve addresses for getReserveData(asset).
 * Not all assets exist on all chains; missing reserves are skipped per asset.
 */

/** Chain key used in code and env (e.g. ETHEREUM, POLYGON). */
const CHAIN_KEYS = ["ETHEREUM", "POLYGON", "OPTIMISM", "ARBITRUM"];

/** Display name for logs and marketId. */
const CHAIN_NAMES = {
  ETHEREUM: "Ethereum",
  POLYGON: "Polygon",
  OPTIMISM: "Optimism",
  ARBITRUM: "Arbitrum",
};

/** Default Aave v3 Pool contract addresses (same on Polygon/Arbitrum/Optimism). */
const DEFAULT_POOL_ADDRESSES = {
  ETHEREUM: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  POLYGON: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  OPTIMISM: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
  ARBITRUM: "0x794a61358D6845594F94dc1DB02A252b5b4814aD",
};

/** RPC URL env key per chain. */
const RPC_ENV_KEYS = {
  ETHEREUM: "ETHEREUM_RPC_URL",
  POLYGON: "POLYGON_RPC_URL",
  OPTIMISM: "OPTIMISM_RPC_URL",
  ARBITRUM: "ARBITRUM_RPC_URL",
};

/** Pool address env key per chain (optional override). */
const POOL_ENV_KEYS = {
  ETHEREUM: "ETHEREUM_POOL_ADDRESS",
  POLYGON: "POLYGON_POOL_ADDRESS",
  OPTIMISM: "OPTIMISM_POOL_ADDRESS",
  ARBITRUM: "ARBITRUM_POOL_ADDRESS",
};

/**
 * Asset symbol -> underlying token address per chain.
 * Used for getReserveData(assetAddress). Missing asset on a chain = skip that asset on that chain.
 */
const ASSET_ADDRESSES = {
  ETHEREUM: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    USDE: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
    crvUSD: "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E",
  },
  POLYGON: {
    USDC: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    USDE: null,
    crvUSD: null,
  },
  OPTIMISM: {
    USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    USDE: null,
    crvUSD: null,
  },
  ARBITRUM: {
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    USDE: null,
    crvUSD: null,
  },
};

/** Asset symbols we support (order for stable output). */
export const SUPPORTED_ASSETS = ["USDC", "USDT", "USDE", "crvUSD"];

/**
 * Build list of chains that have an RPC URL set.
 * @returns {{ chainKey: string, chainName: string, rpcUrl: string, poolAddress: string }[]}
 */
export function getActiveChains() {
  const out = [];
  for (const chainKey of CHAIN_KEYS) {
    const rpcUrl = process.env[RPC_ENV_KEYS[chainKey]];
    if (!rpcUrl || typeof rpcUrl !== "string" || !rpcUrl.trim()) {
      continue;
    }
    const poolAddress =
      (process.env[POOL_ENV_KEYS[chainKey]]?.trim() || DEFAULT_POOL_ADDRESSES[chainKey]).toLowerCase();
    out.push({
      chainKey,
      chainName: CHAIN_NAMES[chainKey],
      rpcUrl: rpcUrl.trim(),
      poolAddress,
    });
  }
  return out;
}

/**
 * Get asset addresses for a chain (only entries with non-null address).
 * @param {string} chainKey
 * @returns {{ symbol: string, address: string }[]}
 */
export function getAssetAddressesForChain(chainKey) {
  const addrs = ASSET_ADDRESSES[chainKey];
  if (!addrs) return [];
  return SUPPORTED_ASSETS.filter((s) => addrs[s] != null).map((symbol) => ({
    symbol,
    address: addrs[symbol],
  }));
}

export { CHAIN_KEYS, CHAIN_NAMES, RPC_ENV_KEYS, ASSET_ADDRESSES };
