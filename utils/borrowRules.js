const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const FINE_CENTS_PER_DAY = 25;

function calculateFine(dueAt, returnedAt) {
  const overdueMilliseconds = Math.max(0, new Date(returnedAt).getTime() - new Date(dueAt).getTime());
  const startedLateDays = Math.ceil(overdueMilliseconds / MILLISECONDS_PER_DAY);
  return (startedLateDays * FINE_CENTS_PER_DAY) / 100;
}

module.exports = { calculateFine };