import { Bot, Composer, InlineKeyboard } from "grammy";
import {
  delete_bot,
  forwardbot_get_bot_token,
  forwardbot_get_bot_username,
  get_user_id,
  insert_bot,
} from "../db/forwardBotDb.js";

export const forwardBotComposer = new Composer();

import { forwardbotres, owner, webhookurl } from "../../server.js";
import { startbots, stopbots } from "../helpers/forwardHelper.js";
import { MessageEntity } from "grammy/types";

function extractBotToken(msgText: string, entities: Array<MessageEntity>) {
  // https://github.com/wjclub/telegram-bot-tokenextract/pull/1
  for (const entity_ in entities) {
    const entity = entities[Number(entity_)];
    if (entity.type == "code") {
      return msgText?.substring(entity.offset, entity.offset + entity.length);
    }
  }
}

forwardBotComposer.on("message:forward_origin", async (ctx) => {
  try {
    const inlineKeyboard = new InlineKeyboard();
    if (ctx.msg.forward_origin.type == "user")
      if (ctx.msg.forward_origin.sender_user.id == 93372553) {
        if (ctx.msg.text) {
          const entities = ctx.message?.entities || [];
          const msgText = ctx.message?.text || "";
          const botUsernameRegex = /t\.me\/(\w+)/;
          const botUsernameMatch = ctx.msg.text.match(botUsernameRegex);
          const botUsername = botUsernameMatch ? botUsernameMatch[1] : null;
          // Extracting the bot token
          const botToken = extractBotToken(msgText, entities);
          // change in bot regex
          const regex = /@(\w+):\s+([\w-:]+)/;
          const match = ctx.msg.text.match(regex);
          const bot_Username = match ? match[1] : null;
          const bot_Token = extractBotToken(msgText, entities);

          if (botToken && botUsername) {
            let bot = new Bot(botToken);
            const webhookres = await bot.api.setWebhook(
              `${webhookurl}/forwardbots/${botToken}`,
              {
                allowed_updates: ["message", "callback_query"],
                drop_pending_updates: true,
              }
            );
            if (webhookres) {
              const data = {
                user_id: ctx.from.id,
                botToken: botToken,
                botUsername: `@${botUsername}`,
              };
              const res = await insert_bot(data);
              if (res) {
                inlineKeyboard
                  .url(
                    `Go to @${botUsername}`,
                    `https://t.me/${botUsername}?start=start`
                  )
                  .row();
                ctx.reply(`The bot was successfully added`, {
                  parse_mode: "HTML",
                  reply_markup: inlineKeyboard,
                });
              } else {
                ctx.reply("This bot is already added");
              }
            } else {
              await ctx.reply(
                "Make sure the bot is not connected to any other services"
              );
            }
          } else if (bot_Token && bot_Username) {
            let bot = new Bot(bot_Token);
            const webhookres = await bot.api.setWebhook(
              `${webhookurl}/forwardbots/${bot_Token}`,
              {
                drop_pending_updates: true,
              }
            );
            if (webhookres) {
              const data = {
                user_id: ctx.from.id,
                botToken: bot_Token,
                botUsername: `@${bot_Username}`,
              };
              const res = await insert_bot(data);
              if (res) {
                inlineKeyboard
                  .url(
                    `Go to @${bot_Username}`,
                    `https://t.me/${bot_Username}?start=start`
                  )
                  .row();
                ctx.reply(`The bot was successfully added`, {
                  parse_mode: "HTML",
                  reply_markup: inlineKeyboard,
                });
              } else {
                ctx.reply("This bot is already added");
              }
            } else {
              await ctx.reply(
                "Make sure the bot is not connected to any other services"
              );
            }
          } else {
            await ctx.reply(
              "Can't get username or bot token from the given messsage"
            );
          }
        }
      } else {
        await ctx.reply(
          "try to Forward the message from bot father with forward tag"
        );
      }
  } catch (error: any) {
    console.log(error.message);
  }
});

forwardBotComposer.chatType("private").command("mybots", async (ctx) => {
  try {
    const bot_username = await forwardbot_get_bot_username(ctx.chat.id);
    if (Object.keys(bot_username).length === 0) {
      await ctx.reply("You don't have any bots");
    } else {
      const botUsernames = bot_username.map(
        (obj: { botUsername: any }) => obj.botUsername
      );
      const messageText = botUsernames.join(" ");
      await ctx.reply(messageText);
    }
  } catch (error: any) {
    console.log(error.message);
  }
});

forwardBotComposer.chatType("private").command("delete", async (ctx) => {
  try {
    const botUsername = ctx.match;
    const { user_id } = await get_user_id(botUsername);
    console.log(user_id);

    if (ctx.from.id == user_id) {
      const botToken = await forwardbot_get_bot_token(botUsername);
      console.log(botToken);

      if (botToken) {
        const bot = new Bot(botToken.botToken);
        if (bot) {
          try {
            const webhookres = await bot.api.deleteWebhook({
              drop_pending_updates: true,
            });
          } catch (error: any) {
            console.log(error.message);
          }
        }
      } else {
        await ctx.reply("You have no bots to delete");
      }
      const { res } = await delete_bot(botUsername);
      if (res) {
        await ctx.reply("Bot deleted successfully");
      } else {
        await ctx.reply("Some thing got wrong while deleting bot");
      }
    }
  } catch (error: any) {
    console.log(error.message);
  }
});

forwardBotComposer.chatType(["private"]).command("startbots", async (ctx) => {
  try {
    if (ctx.from.id == (owner as unknown as number)) {
      if (forwardbotres) {
        await ctx.reply("Bots all going to start");
        await startbots(ctx);
      }
    }
  } catch (error: any) {
    console.log(error.message);
  }
});

forwardBotComposer.chatType(["private"]).command("stopbots", async (ctx) => {
  try {
    if (ctx.from.id == (owner as unknown as number)) {
      if (forwardbotres) {
        await ctx.reply("Bots all going to stop");
        await stopbots(ctx);
      }
    }
  } catch (error: any) {
    console.log(error.message);
  }
});

forwardBotComposer.chatType(["private"]).command("start", async (ctx) => {
  try {
    await ctx.reply(
      `Hi, I am a powerful forward bot creator. To start creating your bot, please forward the message from @BotFather confirming your bot's successful creation.

    Commands:
    - <code>/mybots</code>: Lists the bots you have registered with this bot.
    - <code>/delete</code>: Deletes the target bot.
    
    Example: <code>/delete @yourbot</code>
    `,
      { parse_mode: "HTML" }
    );
  } catch (error: any) {
    console.log(error.message);
  }
});
