import axios from "axios";
import dayjs from "dayjs";
import { WorkDay } from "../services/reports";
import { DateLike } from "../globals.types";
import { CalendarResponse } from "./workCalendar.types";

const request = axios.create({});

const calendars: Record<number, CalendarResponse> = {};

async function getCalendar(year: number): Promise<CalendarResponse> {
  if (calendars[year] === undefined) {
    calendars[year] = (await request
      .get(`http://xmlcalendar.ru/data/ru/${year}/calendar.json`)
      .then(({ data }) => data)) as CalendarResponse;
  }

  return calendars[year];
}

export async function checkDate(date: DateLike): Promise<Omit<WorkDay, "day">> {
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
