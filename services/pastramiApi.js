const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV.includes('production');

const fetch = require('node-fetch');
const logger = require('../utils/logger');

const PASTRAMI_API_ENDPOINT = isProduction ?
  'http://pastramiapi-env.eba-eemspvyp.us-east-1.elasticbeanstalk.com' :
  'http://localhost:8081';

const getUsers = async() => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users`, {
      method: 'GET'
    });

    return await response.json();
  } catch (err) {
    logger.log(err);
  }
};

const getUser = async(discordId) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}`, {
      method: 'GET'
    });

    return await response.json();
  } catch (err) {
    logger.log(err);
  }
};

// gets user data from api and if it doesn't exist, creates a new user
const tryGetUser = async(discordId) => {
  // check to see if user already exists
  const apiUser = await getUser(discordId);
  if (apiUser.error) {
    // user probably doesn't exist in db, create new user
    const newUser = await postNewUser(discordId);

    return newUser;
  }

  return apiUser;
};

const getUser69Check = async(discordId) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}/69check`, {
      method: 'GET'
    });

    return await response.json();
  } catch (err) {
    logger.log(err);
  }
};

const getTotal69s = async() => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/69s`, {
      method: 'GET'
    });

    return await response.json();
  } catch (err) {
    logger.log(err);
  }
};

const postNewUser = async(discordId) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}`, {
      method: 'POST'
    });

    return await response.json();
  } catch (err) {
    logger.log(err);
  }
};

const getGuild = async (guildDiscordId) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/guilds/${guildDiscordId}`, {
      method: 'GET'
    });

    return await response.json();
  } catch (err) {
    logger.log(err);
  }
};

const putUserGreetings = async(discordId, greetingsObj) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}/greetings`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        greetings: greetingsObj
      })
    });

    return await response.json();
  } catch (err) {
    logger.log(err);
  }
};

const deleteUserGreetings = async(discordId, greetingsObj) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}/greetings`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        greetings: greetingsObj
      })
    });

    return await response.json();
  } catch (err) {
    logger.log(err);
  }
};

module.exports = {
  getUsers,
  getUser,
  tryGetUser,
  getUser69Check,
  getTotal69s,
  postNewUser,
  getGuild,
  putUserGreetings,
  deleteUserGreetings
}
