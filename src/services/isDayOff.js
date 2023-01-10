const api = require("isdayoff")();
const dayjs = require("dayjs")

function checkDate(date) {
  const formattedDate = dayjs(date).toDate();

  return api.date(formattedDate).then(res => JSON.stringify(res));
}

function checkPeriod(start, end) {
  const period = {
    start,
    end,
  }
  
  return api.period(period)
    .then(res => JSON.stringify(res))
}

checkPeriod(
  dayjs().subtract(4, "day").toDate(),
  dayjs().add(1, "day").toDate()
).then(res => console.log("period", res));

checkDate(dayjs()).then(res => console.log("date", res));

module.exports = {
  checkPeriod,
  checkDate,
}