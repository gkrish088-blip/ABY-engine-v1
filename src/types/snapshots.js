/**
 * Normalized Market Snapshot
 *
 * This object represents a single point-in-time observation
 * of a DeFi market, normalized across protocols.
 *
 * It is the ONLY input accepted by the Yield Analytics Engine.
 *
 * All fields are expected to be pre-processed upstream.
 * The engine does NOT perform protocol-specific parsing.
 */

/**
 * @typedef {Object} MarketSnapshot
 *
 * @property {string} marketId
 *   Unique identifier for the market
 *   (e.g. "uniswap-v3-usdc-usdt-0.05-arbitrum")
 *
 * @property {string} protocol
 *   Protocol name (e.g. "Uniswap", "Aave", "Curve")
 *
 * @property {string} chain
 *   Blockchain name (e.g. "Ethereum", "Arbitrum")
 *
 * @property {string} asset
 *   Primary asset of the market (e.g. "USDC")
 *
 * @property {number} rawAPY
 *   Instantaneous protocol-reported APY (percentage, not decimal)
 *
 * @property {number} liquidity
 *   Total capital backing the yield (USD)
 *
 * @property {number|null} volume
 *   Optional trading volume (USD)
 *
 * @property {number|null} price
 *   Optional asset price (USD)
 *
 * @property {number} timestamp
 *   Unix timestamp in SECONDS
 *   Must be strictly increasing per market
 */

// This file intentionally exports nothing.
// It serves as a documentation and contract reference only.
