/**
 * Aave v3 indexer — real on-chain data
 *
 * Fetches liquidity rate and supply from Aave v3 Pool per chain.
 * Snapshots are normalized to the engine format; one failure per asset does not crash.
 */
import { ethers } from "ethers";
import { getProviderForUrl } from "../provider.js";
import { getActiveChains, getAssetAddressesForChain } from "../config/chains.js";

const PROTOCOL = "Aave";
const RAY = 1e27;

/** Minimal Aave v3 Pool ABI: getReserveData returns (configuration, liquidityIndex, currentLiquidityRate, ...). */
const POOL_ABI = [
  "function getReserveData(address asset) view returns (tuple(tuple(uint256 data) configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))",
];

/** ERC20 totalSupply and decimals for aToken liquidity. */
const ATOKEN_ABI = ["function totalSupply() view returns (uint256)", "function decimals() view returns (uint8)"];

/**
 * Fetch raw APY and liquidity for one asset from Aave v3 Pool.
 * APY = currentLiquidityRate / 1e27 * 100. Liquidity = aToken totalSupply in human units (USD proxy for stables).
 *
 * @param {ethers.Contract} poolContract
 * @param {string} assetAddress
 * @param {string} symbol
 * @returns {Promise<{ symbol: string, rawAPY: number, liquidity: number } | null>}
 */
async function fetchOneReserve(poolContract, assetAddress, symbol) {
  try {
    const reserveData = await poolContract.getReserveData(assetAddress);
    // Struct may be array (index 2 = currentLiquidityRate, 8 = aTokenAddress) or object
    const currentLiquidityRate = reserveData.currentLiquidityRate ?? reserveData[2];
    const aTokenAddress = reserveData.aTokenAddress ?? reserveData[8];
    if (!aTokenAddress || aTokenAddress === ethers.ZeroAddress) {
      return null;
    }
    const provider = poolContract.runner;
    const aToken = new ethers.Contract(aTokenAddress, ATOKEN_ABI, provider);
    const [totalSupply, decimals] = await Promise.all([aToken.totalSupply(), aToken.decimals()]);
    const divisor = 10 ** Number(decimals);
    const liquidity = Number(totalSupply) / divisor;
    const rawAPY = (Number(currentLiquidityRate) / RAY) * 100;
    return { symbol, rawAPY: Math.max(0, rawAPY), liquidity: Math.max(0, liquidity) };
  } catch (err) {
    return null;
  }
}

/**
 * Fetch snapshots for one chain. One asset failure is skipped; chain/contract errors propagate.
 *
 * @param {{ chainKey: string, chainName: string, rpcUrl: string, poolAddress: string }} chain
 * @param {number} blockNumber
 * @param {number} timestamp - Unix seconds
 * @returns {Promise<Array<{ marketId: string, protocol: string, chain: string, asset: string, rawAPY: number, liquidity: number, timestamp: number }>>}
 */
export async function getSnapshots(chain, blockNumber, timestamp) {
  const provider = getProviderForUrl(chain.rpcUrl);
  const poolContract = new ethers.Contract(chain.poolAddress, POOL_ABI, provider);
  const assets = getAssetAddressesForChain(chain.chainKey);
  const marketId = `aave-v3-${chain.chainName.toLowerCase()}`;
  const chainName = chain.chainName;

  const results = await Promise.all(
    assets.map(({ symbol, address }) => fetchOneReserve(poolContract, address, symbol))
  );

  const snapshots = [];
  for (let i = 0; i < results.length; i++) {
    const row = results[i];
    if (!row) continue;
    snapshots.push({
      marketId,
      protocol: PROTOCOL,
      chain: chainName,
      asset: row.symbol,
      rawAPY: row.rawAPY,
      liquidity: row.liquidity,
      timestamp,
    });
  }
  return snapshots;
}

/**
 * Return list of active chains (with RPC set). Used by server to register block listeners.
 * @returns {{ chainKey: string, chainName: string, rpcUrl: string, poolAddress: string }[]}
 */
export function getChains() {
  return getActiveChains();
}
