/**
 * Returns the number of days in a given month and year.
 * @param {number} year 
 * @param {number} month - Month index (0 = January, 11 = December)
 * @returns {number}
 */
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Returns the first day of the week for a given month and year.
 * @param {number} year 
 * @param {number} month - Month index (0 = January, 11 = December)
 * @returns {number}
 */
function firstDayOfWeek(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Builds a grid of days for a given month and year.
 * @param {number} year 
 * @param {number} month - Month index (0 = January, 11 = December)
 * @returns {Array<number|null>} An array of days, with null for empty cells.
 */
export function buildGrid(year, month) {
  const total = daysInMonth(year, month);
  const start = firstDayOfWeek(year, month);
  const cells = [];
  for (let i = 0; i < start; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(d);
  // pad to full row
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}