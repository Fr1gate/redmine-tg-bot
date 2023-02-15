import schedule from "node-schedule";
import { checkDate } from "../api/workCalendar";
import dayjs from "dayjs";
import { getPrisma } from "../services/db";
import { bot } from "../index";
import { previousWeekReport, prevWorkDayReport } from "../services/reports";

const prisma = getPrisma();

export function initSchedules(): void {
  const dailyRule = new schedule.RecurrenceRule();
  dailyRule.hour = 10;

  schedule.scheduleJob(dailyRule, async () => {
    try {
      console.log("job")
      // check if current day is workday
      const { isOff } = await checkDate(dayjs());

      if (isOff) return;

      const registeredUsers = await prisma.user.findMany({
        where: {
          redmine_token: {
            not: null,
          },
        },
      });

      const isWeekStart = dayjs().startOf("day") === dayjs().startOf("week");

      for (const user of registeredUsers) {
        try {
          if (user.redmine_token === null) return;

          const report = isWeekStart
            ? await previousWeekReport(user.redmine_token)
            : await prevWorkDayReport(user.redmine_token);

          void bot.telegram.sendMessage(user.telegram_id, report, {
            parse_mode: "MarkdownV2",
          });
        } catch (e) {
          console.log("Error processing user_id: ", user.id);
          console.log(e);
        }
      }
    } catch (e) {
      console.log("Faced error while executing job", e);
    }
  });
}