/**
 * Updates a value using time-based EMA.
 *
 * @param {number} previousValue - Last stored value
 * @param {number} newValue - Incoming observation
 * @param {number} deltaTime - Time elapsed since last update (seconds)
 * @param {number} timeConstant - Decay time constant τ (seconds)
 * @returns {number} Updated EMA value
 */
export function emaUpdate(previousValue, newValue, deltaTime, timeConstant) {
  //checks
  if (!Number.isFinite(previousValue)) return newValue;
  if (!Number.isFinite(newValue)) return previousValue;
  if (!Number.isFinite(deltaTime) || deltaTime <= 0) return previousValue;
  if (!Number.isFinite(timeConstant) || timeConstant <= 0) return newValue;

  const alpha = 1 - Math.exp(-deltaTime/timeConstant);
    return previousValue + alpha*(newValue - previousValue)
}



/* 
This function will be used like this later 
mu = emaUpdate(mu, rawAPY, deltaT, TIME_CONSTANTS.APY_LEVEL);
 */