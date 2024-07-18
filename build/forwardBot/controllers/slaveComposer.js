import { Composer } from "grammy";
import { get_user_id } from "../db/forwardBotDb.js";
export const SlaveforwardBotComposer = new Composer();
const usersSettings = new Map();
const taskQueue = {
    tasks: [],
    enqueue(task) {
        this.tasks.push(task);
    },
    dequeue() {
        return this.tasks.shift();
    },
    isEmpty() {
        return this.tasks.length === 0;
    },
};
SlaveforwardBotComposer.chatType(["private"]).command("startforward", async (ctx, next) => {
    async function longtask() {
        var _a;
        try {
            const user = usersSettings.get(ctx.me.username);
            if (user) {
                if (!(user === null || user === void 0 ? void 0 : user.isEngaged)) {
                    const { user_id } = await get_user_id(`@${ctx.me.username}`);
                    if (ctx.from.id == user_id) {
                        const text = (_a = ctx.msg.reply_to_message) === null || _a === void 0 ? void 0 : _a.text;
                        if (text) {
                            const regex = /-?\d+/g;
                            const matchResult = text.match(regex);
                            const numbers = matchResult ? matchResult.map(Number) : [];
                            user.fromChatId = numbers[0];
                            user.toChatId = numbers[1];
                            user.fromMessageId = numbers[2];
                            user.toMessageId = numbers[3];
                            const messageCount = user.toMessageId - user.fromMessageId + 1;
                            user.requests = Math.ceil(messageCount / 100);
                            console.log("fromChatId:", user.fromChatId);
                            console.log("toChatId:", user.toChatId);
                            console.log("fromMessageId:", user.fromMessageId);
                            console.log("toMessageId:", user.toMessageId);
                            const fromchat = await ctx.api.getChat(user.fromChatId);
                            const tochat = await ctx.api.getChat(user.toChatId);
                            if (fromchat && tochat) {
                                user.isEngaged = true;
                                for (user.i = 0; user.i < user.requests; user.i++) {
                                    var messageIds = [];
                                    for (let j = 0; j < 100; j++) {
                                        var messageId = user.fromMessageId + user.i * 100 + j;
                                        if (messageId <= user.toMessageId) {
                                            messageIds.push(messageId);
                                        }
                                    }
                                    await ctx.api.copyMessages(user.toChatId, user.fromChatId, messageIds);
                                    if (user.confirmation == false && user.isEngaged == true) {
                                        user.confirmation = true;
                                        await ctx.reply("The task started successfully");
                                    }
                                }
                                if (user.i == user.requests) {
                                    await ctx.reply("The forward completed successfully. \n\nNote: It may take some time to fully complete the forward, because the forward messages you see in channel after this successfull message are rate-limited messages from Telegram. Please check the destination channel to ensure the forward is finished and refrain from running any tasks until it has stopped.");
                                    user.fromChatId = 0;
                                    user.toChatId = 0;
                                    user.fromMessageId = 0;
                                    user.toMessageId = 0;
                                    user.requests = 0;
                                    user.confirmation = false;
                                    user.i = 0;
                                    user.isEngaged = false;
                                }
                            }
                            else {
                                await ctx.reply("ReCheck the channels id you have given.");
                            }
                        }
                        else {
                            await ctx.reply("Reply to the message in the suggested format.");
                        }
                    }
                }
                else {
                    ctx.reply("A forward task is already running, you can't create another task unitil its completed. stop it using /stopforward");
                }
            }
            else {
                await ctx.reply("Sent start first /start");
            }
        }
        catch (error) {
            console.log(error.message);
            if (error.message ==
                "Call to 'getChat' failed! (400: Bad Request: chat not found)") {
                ctx.reply(`Make sure your bot is admin in both of the channels.`);
            }
            else if (error.message ==
                "Call to 'copyMessages' failed! (400: Bad Request: there are no messages to forward") {
                ctx.reply(`there are no messages to forward, Maybe the messages are deleted`);
            }
        }
    }
    taskQueue.enqueue(longtask);
    await next();
});
setInterval(async () => {
    // To execute the task, you could call dequeue and then execute the returned function
    if (!taskQueue.isEmpty()) {
        const taskToExecute = taskQueue.dequeue();
        if (taskToExecute) {
            await taskToExecute()
                .then(() => {
                console.log("Task executed");
            })
                .catch((error) => {
                console.error("Task execution failed", error);
            });
        }
    }
}, 2000);
SlaveforwardBotComposer.chatType(["private"]).command("start", async (ctx) => {
    try {
        const user = usersSettings.get(ctx.me.username);
        if (!user) {
            usersSettings.set(ctx.me.username, {
                fromChatId: 0,
                toChatId: 0,
                fromMessageId: 0,
                toMessageId: 0,
                requests: 0,
                confirmation: false,
                i: 0,
                isEngaged: false,
            });
        }
        await ctx.reply(`Hi, <b>I am a powerful forward bot,</b> created by <a href=\"https://t.me/Forward_father_bot\">@Forward_father_bot</a>. You can simply send me a text in the following format:
    <pre>fromChatId: -1001976486626
toChatId: -1001863857901
frommsgid: 5
tomsgid: 1000</pre>
    
    Reply to this text with <code>/startforward</code> to begin forwarding messages instantly.
    
    Use <code>/stopforward</code> to stop the forwarding process, and <code>/clearcache</code> to erase stored settings \n\n<b>Don't use /clearcache while performing a task. only use it when the bot got stuck.</b>`, { parse_mode: "HTML" });
    }
    catch (error) {
        console.log(error.message);
    }
});
SlaveforwardBotComposer.chatType(["private"]).command("stopforward", async (ctx) => {
    try {
        const user = usersSettings.get(ctx.me.username);
        if (user) {
            const { user_id } = await get_user_id(`@${ctx.me.username}`);
            if (ctx.from.id == user_id) {
                if (user.isEngaged == true) {
                    user.fromChatId = 0;
                    user.toChatId = 0;
                    user.fromMessageId = 0;
                    user.toMessageId = 0;
                    user.requests = 0;
                    user.confirmation = false;
                    user.i = 0;
                    user.isEngaged = false;
                    await ctx.reply("The forward stopped successfully. \n\nNote: It may take some time to fully stop the forward, because the forward messages you see in channel after this successfull message are rate-limited messages from Telegram. Please check the destination channel to ensure the forward is finished and refrain from running any tasks until it has stopped.");
                }
                else {
                    await ctx.reply("There no running process to stop");
                }
            }
        }
        else {
            await ctx.reply("Sent start first /start");
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
SlaveforwardBotComposer.chatType(["private"]).command("clearcache", async (ctx) => {
    try {
        const user = usersSettings.get(ctx.me.username);
        if (user) {
            const { user_id } = await get_user_id(`@${ctx.me.username}`);
            if (!user.isEngaged) {
                if (ctx.from.id == user_id) {
                    user.fromChatId = 0;
                    user.toChatId = 0;
                    user.fromMessageId = 0;
                    user.toMessageId = 0;
                    user.requests = 0;
                    user.confirmation = false;
                    user.i = 0;
                    user.isEngaged = false;
                    await ctx.reply("Cache cleared successfully");
                }
            }
            else {
                await ctx.reply("You can't use /clearcache while running a task.");
            }
        }
        else {
            await ctx.reply("Sent start first /start");
        }
    }
    catch (error) {
        console.log(error.message);
    }
});
