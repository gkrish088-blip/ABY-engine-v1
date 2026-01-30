/**
 * Time-based Exponential Moving Average (EMA)
 *
 * This utility implements continuous-time exponential decay:
 *   α = 1 - exp(-Δt / τ)
 *
 * It is the core mathematical primitive used across the engine.
 *
 * This function is deterministic, stateless, and protocol-agnostic.
 */
