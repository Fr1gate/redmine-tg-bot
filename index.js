require("dotenv").config();
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');
const process = require("node:process");
const {prevWorkDayReport} = require("./src/services/reports.js");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
bot.command("check", async (ctx) => {
  const report = await prevWorkDayReport();
  ctx.replyWithMarkdownV2(report);
})
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));