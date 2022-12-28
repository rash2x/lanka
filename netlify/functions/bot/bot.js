const {Telegraf, Scenes, session} = require('telegraf');
const {startScene} = require('./scenes/start.js');
const {orderScene} = require('./scenes/createNewOrder.js');
const {masks} = require('./utils.js');
const {sceneNames} = require('./constants.js');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const stage = new Scenes.Stage([startScene, orderScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
  await ctx.scene.enter(sceneNames.START);
});

bot.hears(masks.order, async (ctx) => {
  await ctx.scene.enter(sceneNames.CREATE_NEW_ORDER);
});

const handler = async (event) => {
  try {
    await bot.handleUpdate(JSON.parse(event.body)).then(() => {
      console.log('Received an update from Telegram!', event.body);
    });
    return {statusCode: 200};
  } catch (e) {
    console.log(e);
    return {statusCode: 400, body: 'This endpoint is meant for bot and telegram communication'};
  }
};

module.exports = {
  handler,
  bot
};
