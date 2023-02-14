require('../utils/getDotenv');
const NODE_ENV = process.env.NODE_ENV;
const PASTRAMI_SECRET = process.env.PASTRAMI_API_SECRET;
const isProduction = NODE_ENV.includes('production');

const fetch = require('node-fetch');
const logger = require('../utils/logger');
const { getIsAdminId } = require('../utils/adminHelpers');

// banning related imports... TODO: handle in DB/API instead of JSON file
const fs = require('fs');

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
  try {
    // check to see if user already exists
    const apiUser = await getUser(discordId);
    if (apiUser.error) {
      // user probably doesn't exist in db, create new user
      const newUser = await postNewUser(discordId);

      return newUser;
    }

    return apiUser;
  } catch (err) {
    logger.log(err);
  }
};

// TODO: implement banlist in db/api
const getIsUserBannedData = async(discordId) => {
  if (getIsAdminId(discordId)) return false;

  const banlist = require('../data/banlist.json');
  const userBanData = banlist[discordId];

  if (!userBanData || userBanData?.timestamp === -1) { return { banned: false }; }

  return { banned: true, data: userBanData };
};

// TODO: implement banlist in db/api
const banUser = async (discordId, reason) => {
  if (getIsAdminId(discordId)) {
    return { banned: false, failReason: 'user is admin', discordId };
  }

  const banlist = require('../data/banlist.json');

  let userBanData = banlist[discordId];

  if (!userBanData) {
    // user ban data does not currently exist
    userBanData = {
      timestamp: new Date().getTime(),
      reason,
      prevReasons: []
    };
  } else {
    // user ban data already exists
    if (userBanData.timestamp > 0) {
      // user is already banned currently
      return { banned: false, failReason: 'user is already banned', discordId };
    }

    userBanData = {
      ...userBanData,
      timestamp: new Date().getTime(),
      reason
    };
    
  }

  banlist[discordId] = userBanData;
  fs.writeFileSync('./data/banlist.json', JSON.stringify(banlist, null, 2));

  return { banned: true, discordId };
};

// TODO: implement banlist in db/api
const unbanUser = async (discordId) => {
  const banlist = require('../data/banlist.json');
  const bannedUserIds = Object.keys(banlist);
  if (bannedUserIds.length === 0) return { unbanned: false, failReason: 'no current users are banned', discordId };

  let userBanData = banlist[discordId];

  if (!userBanData) {
    // user ban data does not exist\
    return { unbanned: false, failReason: 'user is not currently banned', discordId };
  } else {
    let reason = userBanData.reason;
    if (reason.length === 0) {
      reason = '*no reason provided*';
    }
    userBanData = {
      timestamp: -1,
      reason: '',
      prevReasons: [...userBanData.prevReasons, reason]
    };

    banlist[discordId] = userBanData;
    fs.writeFileSync('./data/banlist.json', JSON.stringify(banlist, null, 2));

    return { unbanned: true, discordId };
  }
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
      method: 'POST',
      headers: {
        'Authorization': PASTRAMI_SECRET,
      },
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
        'Content-type': 'application/json',
        'Authorization': PASTRAMI_SECRET,
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
        'Content-Type': 'application/json',
        'Authorization': PASTRAMI_SECRET,
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
  getIsUserBannedData,
  banUser,
  unbanUser,
  getUser69Check,
  getTotal69s,
  postNewUser,
  getGuild,
  putUserGreetings,
  deleteUserGreetings
}
