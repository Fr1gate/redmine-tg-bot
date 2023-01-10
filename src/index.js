require("dotenv").config();
const { Telegraf, Markup} = require('telegraf');
const { message } = require('telegraf/filters');
const process = require("node:process");
const {prevWorkDayReport} = require("./services/reports.js");
const { DBService } = require("./services/db.js");
const { RedmineAPI } = require("./api/redmine.js");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => {
  const user_id = ctx.update.message.from.id;
  const user = DBService.getUser(user_id);

  if (!user) {
    DBService.setUser(user_id, {
      waitingToken: true,
    })

    ctx.reply(
      'Привет! Меня зовут RedmiBot! В нашем убежище под названием Brainstorm одним из главных ресурсов является затраченные часы. Мы накапливаем их, а потом обмениваем на деньги у наших клиентов. Ведение информации о затраченных часах важная часть нашей работы. Я помогу не забыть тебе об их заполнении!\n\n' +
      'У нас есть специальная программа, в которой можно все заполнить, но для начала нам нужно туда попасть. Главный разработчик заложил в меня инструкцию, там написано: "Зайди в приложение Redmine, личный кабинет и там справа будет надпись: "Ключ доступа к API", он то нам и нужен"\n\n' +
      'Пссс 🤫, я слышал что можно и логину и паролю, но это не секьюрно, вдруг я его потеряю, так что давай лучше через ключик. Вставь его, если нашел',
    )
  } else {
    ctx.reply("Ты уже в системе, если нужна помощь, жми /help!");
  }
});
bot.help((ctx) => {
  ctx.reply(
    "Вот что я умею на данный момент. Я как и ты стремлюсь становиться лучше, но на это нужно время...\n" +
    "/today - список времени за сегодня\n" +
    "/week - список времени за неделю"
  )
})
bot.on(message("text"), (ctx) => {
  const user_id = ctx.update.message.from.id;
  const user = DBService.getUser(user_id);
  if (user.waitingToken) {
    ctx.reply("Устанавливаю соединение!");
    RedmineAPI.getUser(ctx.message.text)
      .then((redmineUser) => {
        ctx.reply(`Ура!! Все получилось, теперь я смогу тебе напомнить о заполненных часах, ${redmineUser.firstname} ${redmineUser.lastname}`);
        DBService.setUser(user_id, {
          ...user,
          waitingToken: false,
          redmineToken: ctx.message.text,
        })
      })
      .catch(() => {
        ctx.reply("Что-то пошло не так, ты точно токен вставил? Давай попробуем еще раз");
      })
  }
})
bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
// bot.command("check", async (ctx) => {
//   const user_id = ctx.update.message.from.id;
//   const report = await prevWorkDayReport(user_id);
//   ctx.replyWithMarkdownV2(report);
// })
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));