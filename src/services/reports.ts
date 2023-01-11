const dayjs = require("dayjs");
const {checkDate} = require("../api/workCalendar.js");
const {getTimeEntries, getIssue} = require("../api/redmine.js");

async function getPrevWorkDay(): Promise<{

}> {
  let day = dayjs().startOf("day").subtract(1);
  let emergencyBreak = 0;
  while (true) {
    const curDay = await checkDate(day);
    if (!curDay.isOff) {
      return {
        ...curDay, day,
      }
    }
    day = day.subtract(1);

    emergencyBreak++;
    if (emergencyBreak > 100) {
      throw new Error("Couldn't find work day");
    }
  }
}

async function prevWorkDayReport(user_id: number) {
  return dayReport(user_id, await getPrevWorkDay());
}

async function todayReport(user_id: number) {
  return dayReport(user_id, new Date());
}

async function dayReport(user_id: number, date) {
  const timeEntries = await getTimeEntries(date.day, date.day);
  
  let totalHours = 0;
  let messByTasks = "";
  for (const entry of timeEntries) {
    totalHours += entry.hours;
    const issue = await getIssue(entry.issue.id)
    const name_length = 50;
    const name = issue.subject.length > name_length
      ? issue.subject.slice(0, name_length).concat("...")
      : issue.subject;
    const issueLink = `https://redmine.brainstorm-lab.com/issues/${issue.id}`;
    messByTasks += `[\\#${entry.issue.id} \\| ${name}](${issueLink}) \\- ${entry.hours}\n`;
  }
  
  return `Отчёт за ${dayjs(date.day).format("DD\\.MM\\.YYYY")}

${messByTasks}
Всего часов: ${totalHours}`
}

module.exports = {
  prevWorkDayReport,
  todayReport,
}
