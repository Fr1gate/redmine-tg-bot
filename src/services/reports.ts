import dayjs, { Dayjs } from "dayjs";
import { checkDate } from "../api/workCalendar";
import { RedmineAPI } from "../api/redmine";
import { DateLike } from "../globals.types";
import { DATE_FORMATS, TELEGRAM_MV2_ESCAPED_CHARS_REGEX } from "../constants";

export interface WorkDay {
  isOff: boolean;
  isShort: boolean;
  day: Dayjs;
}

function getRedmineIssueLink(id: string): string {
  return `https://redmine.brainstorm-lab.com/issues/${id}`;
}

function escapeNumber(num: number): string {
  return String(num).replace(".", "\\.");
}

function escapeStr(str: string): string {
  return str.replaceAll(TELEGRAM_MV2_ESCAPED_CHARS_REGEX, "\\$1");
}

function truncateEscapeString(str: string, length: number = 30): string {
  return escapeStr(
    str.slice(0, length).concat(str.length > length ? "..." : "")
  );
}

async function getPrevWorkDay(): Promise<WorkDay> {
  let day = dayjs().startOf("day").subtract(1);
  let emergencyBreak = 0;
  while (true) {
    const curDay = await checkDate(day);
    if (!curDay.isOff) {
      return {
        ...curDay,
        day,
      };
    }
    day = day.subtract(1);

    emergencyBreak++;
    if (emergencyBreak > 100) {
      throw new Error("Couldn't find work day");
    }
  }
}

export async function prevWorkDayReport(redmineToken: string): Promise<string> {
  return await dayReport(redmineToken, await getPrevWorkDay());
}

export async function todayReport(redmineToken: string): Promise<string> {
  return await dayReport(redmineToken, {
    ...(await checkDate(dayjs())),
    day: dayjs(),
  });
}

export async function currentWeekReport(redmineToken: string): Promise<string> {
  return await weekReport(redmineToken, dayjs());
}

export async function previousWeekReport(
  redmineToken: string
): Promise<string> {
  return await weekReport(redmineToken, dayjs().subtract(1, "week"));
}

async function dayReport(redmineToken: string, date: WorkDay): Promise<string> {
  const timeEntries = await RedmineAPI.getTimeEntries(
    redmineToken,
    date.day,
    date.day
  );

  let totalHours = 0;
  let messByTasks = "";
  for (const entry of timeEntries) {
    totalHours += +entry.hours;
    const issue = await RedmineAPI.getIssue(
      redmineToken,
      String(entry.issue.id)
    );
    const name = truncateEscapeString(issue.subject);
    const issueLink = `https://redmine.brainstorm-lab.com/issues/${issue.id}`;
    messByTasks += `[\\#${String(
      entry.issue.id
    )} \\| ${name}](${issueLink}) \\- ${escapeNumber(entry.hours)}\n`;
  }

  return `Отчёт за ${dayjs(date.day).format("DD\\.MM\\.YYYY")}

${messByTasks}
Всего часов: ${escapeNumber(totalHours)}`;
}

async function weekReport(
  redmineToken: string,
  date: DateLike
): Promise<string> {
  const dateStart = dayjs(date).startOf("week");
  const weekEnd = dayjs(date).endOf("week");
  const today = dayjs();
  const dateEnd = weekEnd < today ? weekEnd : today;

  const timeEntries = await RedmineAPI.getTimeEntries(
    redmineToken,
    dateStart,
    dateEnd
  );

  let messageByTasks = "";
  let messageByDays = "";
  let totalHours: number = 0;

  const hoursByTasks: Record<
    string,
    { hours: number; name: string | undefined }
  > = {};
  const hoursByDays: Record<string, number> = {};

  timeEntries.forEach((entry) => {
    totalHours += +entry.hours;

    // by days
    const taskDate = dayjs(entry.spent_on)
      .startOf("day")
      .format(DATE_FORMATS.dotForMarkdown);
    if (hoursByDays[taskDate] === undefined) {
      hoursByDays[taskDate] = entry.hours;
    } else {
      hoursByDays[taskDate] += +entry.hours;
    }

    // by tasks
    if (hoursByTasks[entry.issue.id] === undefined) {
      hoursByTasks[entry.issue.id] = {
        hours: entry.hours,
        name: entry.issue.name,
      };
    } else {
      hoursByTasks[entry.issue.id].hours += +entry.hours;
    }
  });

  // By days
  const sortedDays = Object.entries(hoursByDays).sort(([date1], [date2]) => {
    return Number(dayjs(date1) < dayjs(date2));
  });

  sortedDays.forEach(([date, hours]) => {
    messageByDays += `${date} \\- ${escapeNumber(hours)}ч\n`;
  });

  // By tasks
  console.log(hoursByTasks);

  Object.entries(hoursByTasks).forEach(([taskId, { hours, name }]) => {
    messageByTasks += `[\\#${String(taskId)} \\| ${
      name ?? ""
    }](${getRedmineIssueLink(taskId)}) \\- ${escapeNumber(hours)}\n`;
  });

  return `Отчёт за ${dayjs(dateStart).format(
    DATE_FORMATS.dotForMarkdown
  )} \\- ${dayjs(dateEnd).format(DATE_FORMATS.dotForMarkdown)}

По задачам:
${messageByTasks}

По дням:
${messageByDays}

Всего часов: ${escapeNumber(totalHours)}
`;
}
