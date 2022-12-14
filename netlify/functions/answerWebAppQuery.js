const {bot} = require('./bot/bot.js');

const handler = async (event) => {
  const payload = JSON.parse(event.body);

  try {
    await bot.telegram.answerWebAppQuery(payload.queryId, {
      ...payload
    })

    return {
      statusCode: 200,
      body: `OK`
    };
  } catch (e) {
    console.log(e);
    return {statusCode: 400, body: 'something wrong'};
  }

};

module.exports = {handler};