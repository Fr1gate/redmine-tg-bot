const axios = require("axios");
const dayjs = require("dayjs");

const request = axios.create({});

const calendars = {};

function getCalendar(year) {
  if (!calendars[year])
    calendars[year] = request
      .get(`http://xmlcalendar.ru/data/ru/${year}/calendar.json`)
      .then(({data}) => data);
  
  return calendars[year]
}

async function checkDate(date) {
  const year = dayjs(date).year();
  const day = dayjs(date).date();
  
  const calendar = await getCalendar(year);
  const days = calendar.months.find(month => {
    return month.month === dayjs(date).month() + 1;
  }).days.split(",");
  // console.log(days, day);
  
  const isOff = days.includes(String(day))
  const isShort = days.includes(`${day}*`)
  return {
    isOff,
    isShort
  }
}

module.exports = {
  checkDate,
}
