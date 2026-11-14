function buildBookingOverlapFilter({ space, date, startTime, endTime }) {
  return {
    space,
    date,
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
}

module.exports = { buildBookingOverlapFilter };