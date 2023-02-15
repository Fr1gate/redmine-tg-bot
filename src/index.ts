import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import * as dotenv from "dotenv";
import { TelegramCommands } from "./telegram/commands";
import schedule from "node-schedule";
import { initSchedules } from "./schedule/schedule";

dotenv.config();

if (process.env.BOT_TOKEN === undefined) {
  console.error("Error: NO TELEGRAM TOKEN");
  throw new Error("process.env.BOT_TOKEN is empty");
}

export const bot = new Telegraf(process.env.BOT_TOKEN);

initSchedules();

// COMMANDS
bot.start(TelegramCommands.startHandler);
bot.help((ctx) => {
  void ctx.reply(TelegramCommands.getHelpResponse());
});
bot.command("today", TelegramCommands.handleToday);
bot.command("week", TelegramCommands.handleWeek);
bot.on(message("text"), TelegramCommands.handleText);
bot.on(message("sticker"), async (ctx) => await ctx.reply("👍"));

void bot.launch();

// Enable graceful stop
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  console.log("gracefult shutdown")
  void schedule.gracefulShutdown();
});
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  console.log("gracefult shutdown")
  void schedule.gracefulShutdown();
});
