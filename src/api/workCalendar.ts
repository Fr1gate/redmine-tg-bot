import axios from "axios";
import dayjs from "dayjs";

const request = axios.create({});

interface CalendarResponse {
  year: number;
  months: Array<{
    month: number;
    days: string;
  }>;
  transitions: Array<{
    from: string;
    to: string;
  }>;
  statistic: {
    workdays: number;
    holidays: number;
    hours40: number;
    hours36: number;
    hours24: number;
  };
}

const calendars: Record<number, CalendarResponse> = {};

async function getCalendar(year: number): Promise<CalendarResponse> {
  if (calendars[year] !== undefined) {
    calendars[year] = (await request
      .get(`http://xmlcalendar.ru/data/ru/${year}/calendar.json`)
      .then(({ data }) => data)) as CalendarResponse;
  }

  return calendars[year];
}

async function checkDate(date: Date | string | dayjs.Dayjs): Promise<{
  isOff: boolean;
  isShort: boolean;
}> {
  const year = dayjs(date).year();
  const day = dayjs(date).date();

  const calendar = await getCalendar(year);
  const month = calendar.months.find((month) => {
    return month.month === dayjs(date).month() + 1;
  });
  const days = month?.days.split(",") ?? [];
  const isOff = days.includes(String(day));
  const isShort = days.includes(`${day}*`);
  return {
    isOff,
    isShort,
  };
}

module.exports = {
  checkDate,
};
