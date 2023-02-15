import { Context } from "telegraf";
import { currentWeekReport, todayReport } from "../services/reports";
import { getPrisma } from "../services/db";
import { message } from "telegraf/filters";
import { RedmineAPI } from "../api/redmine";

const prisma = getPrisma();

export const TelegramCommands = {
  getHelpResponse() {
    return (
      "Вот что я умею на данный момент. Я как и ты стремлюсь становиться лучше, но на это нужно время...\n" +
      "/today - список времени за сегодня\n" +
      "/week - список времени за неделю"
    );
  },
  async handleToday(ctx: Context, next: Function) {
    if (!ctx.has(message("text"))) return next();

    const user = await prisma.user.findFirst({
      where: {
        telegram_id: String(ctx.update.message.from.id),
      },
    });

    if (user === null || user.redmine_token === null) {
      return; // should never occur
    }

    const report = await todayReport(user.redmine_token);

    void ctx.replyWithMarkdownV2(report);
  },
  async handleWeek(ctx: Context, next: Function) {
    if (!ctx.has(message("text"))) return next();

    const user = await prisma.user.findFirst({
      where: {
        telegram_id: String(ctx.update.message.from.id),
      },
    });

    if (user === null || user.redmine_token === null) {
      return; // should never occur
    }

    const report = await currentWeekReport(user.redmine_token);

    void ctx.replyWithMarkdownV2(report);
  },
  async handleText(ctx: Context, next: Function) {
    if (!ctx.has(message("text"))) return next();

    const telegramId = String(ctx.update.message.from.id);
    const user = await prisma.user.findFirst({
      where: {
        telegram_id: telegramId,
      },
    });
    if (user !== null && user.redmine_token === null) {
      void ctx.reply("Устанавливаю соединение!");
      RedmineAPI.getUser(ctx.message.text)
        .then(async (redmineUser) => {
          void ctx.reply(
            `Ура!! Все получилось, теперь я смогу тебе напомнить о заполненных часах, ${redmineUser.firstname} ${redmineUser.lastname}`
          );
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              redmine_token: ctx.message.text,
            },
          });
        })
        .catch(() => {
          void ctx.reply(
            "Что-то пошло не так, ты точно токен вставил? Давай попробуем еще раз"
          );
        });
    } else {
      void ctx.reply("Если нужна помощь, жми /help!")
      void next();
    }
  },
  async startHandler(ctx: Context, next: Function) {
    if (!ctx.has(message("text"))) return next();

    const telegramId = String(ctx.update.message.from.id);
    const user = await prisma.user.findFirst({
      where: {
        telegram_id: telegramId,
      },
    });

    if (user == null) {
      await prisma.user.create({
        data: {
          telegram_id: telegramId,
        },
      });

      await ctx.reply(
        "Привет! Меня зовут RedmiBot! В нашем убежище под названием Brainstorm одним из главных ресурсов является затраченные часы. Мы накапливаем их, а потом обмениваем на деньги у наших клиентов. Ведение информации о затраченных часах важная часть нашей работы. Я помогу не забыть тебе об их заполнении!\n\n" +
          'У нас есть специальная программа, в которой можно все заполнить, но для начала нам нужно туда попасть. Главный разработчик заложил в меня инструкцию, там написано: "Зайди в приложение Redmine, личный кабинет и там справа будет надпись: "Ключ доступа к API", он то нам и нужен"\n\n' +
          "Пссс 🤫, я слышал что можно и логину и паролю, но это не секьюрно, вдруг я его потеряю, так что давай лучше через ключик. Вставь его, если нашел"
      );
    } else {
      await ctx.reply("Ты уже в системе, если нужна помощь, жми /help!");
    }
  },
};
