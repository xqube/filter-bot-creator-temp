import { Bot, Context } from "grammy";
import { forwardbotmongoconnect } from "../db/dbConfig.js";

export const db = await forwardbotmongoconnect();

import { webhookurl } from "../../server.js";

export const startbots = async (ctx: Context) => {
  try {
    let thispage = 0;
    let page = 1;
    let currentDoc = 0;
    let bots = 0;
    let errorbot = 0;
    const totalsize = await db.BotsCollection.countDocuments();
    async function turnonbots(page: number) {
      const skip = (page - 1) * 1;
      const filteredDocs = await db.BotsCollection.find()
        .skip(skip)
        .limit(1)
        .toArray();

      if (filteredDocs.length === 0) {
        await ctx.reply("All bots started");
        return;
      } else {
        const token = filteredDocs[0]?.botToken;
        if (token) {
          const bot = new Bot(token);
          try {
            const res = await bot.api.setWebhook(
              `${webhookurl}/forwardbots/${token}`,
              {
                drop_pending_updates: true,
                allowed_updates: ["message", "callback_query"]
              }
            );
            if (res) {
              currentDoc = currentDoc + 1;
              bots = bots + 1;
              thispage = page + 1;
              if (currentDoc == totalsize) {
                await ctx.reply(
                  `Total Bots: ${bots}, error bots: ${errorbot}`
                );
              }
              await turnonbots(thispage);
            }
          } catch (error: any) {
            currentDoc = currentDoc + 1;
            errorbot = errorbot + 1;
            thispage = page + 1;
            if (currentDoc == totalsize) {
              await ctx.reply(
                `Total Bots: ${bots}, error bots: ${errorbot}`
              );
            }
            await turnonbots(thispage);
            console.log(error.message);
          }
        } else {
          thispage = page + 1;
          currentDoc = currentDoc + 1;
          if (currentDoc == totalsize) {
            await ctx.reply(
              `Total Bots: ${bots}, error bots: ${errorbot}`
            );
          }
          await turnonbots(thispage);
        }
      }
    }
    await turnonbots(page);
  } catch (error: any) {
    console.log(error.message);
  }
};

export const stopbots = async (ctx: Context) => {
  try {
    let thispage = 0;
    let page = 1;
    let currentDoc = 0;
    let bots = 0;
    let errorbot = 0;
    const totalsize = await db.BotsCollection.countDocuments();
    async function turnonbots(page: number) {
      const skip = (page - 1) * 1;
      const filteredDocs = await db.BotsCollection.find()
        .skip(skip)
        .limit(1)
        .toArray();

      if (filteredDocs.length === 0) {
        await ctx.reply("All bots stopped");
        return;
      } else {
        const token = filteredDocs[0]?.botToken;
        if (token) {
          const bot = new Bot(token);
          try {
            const res = await bot.api.deleteWebhook({
              drop_pending_updates: true,
            });
            if (res) {
              currentDoc = currentDoc + 1;
              bots = bots + 1;
              thispage = page + 1;
              if (currentDoc == totalsize) {
                await ctx.reply(
                  `Total Bots: ${bots}, error bots: ${errorbot}`
                );
              }
              await turnonbots(thispage);
            }
          } catch (error: any) {
            currentDoc = currentDoc + 1;
            errorbot = errorbot + 1;
            thispage = page + 1;
            if (currentDoc == totalsize) {
              await ctx.reply(
                `Total Bots: ${bots}, error bots: ${errorbot}`
              );
            }
            await turnonbots(thispage);
            console.log(error.message);
          }
        } else {
          thispage = page + 1;
          currentDoc = currentDoc + 1;
          if (currentDoc == totalsize) {
            await ctx.reply(
              `Total Bots: ${bots}, error bots: ${errorbot}`
            );
          }
          await turnonbots(thispage);
        }
      }
    }
    await turnonbots(page);
  } catch (error: any) {
    console.log(error.message);
  }
};
