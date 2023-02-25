require('../utils/getDotenv');
const NODE_ENV = process.env.NODE_ENV;
const PASTRAMI_SECRET = process.env.PASTRAMI_API_SECRET;
const isProduction = NODE_ENV.includes('production');

const fetch = require('node-fetch');
const { errorHandler } = require('./errorHandler');
const { isDiscordId } = require('../utils/regexHelpers');
const { getIsAdminId } = require('../utils/adminHelpers');

const authHeaderObj = {
  'Authorization': PASTRAMI_SECRET,
};

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
    errorHandler(err);
  }
};

/* USERS */

const getUser = async(discordId) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}`, {
      method: 'GET'
    });

    return await response.json();
  } catch (err) {
    errorHandler(err);
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
    errorHandler(err);
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

const getUser69Check = async(discordId) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}/69check`, {
      method: 'GET'
    });

    return await response.json();
  } catch (err) {
    errorHandler(err);
  }
};

const getTotal69s = async() => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/69s`, {
      method: 'GET'
    });

    return await response.json();
  } catch (err) {
    errorHandler(err);
  }
};

const postNewUser = async(discordId) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}`, {
      method: 'POST',
      headers: authHeaderObj,
    });

    return await response.json();
  } catch (err) {
    errorHandler(err);
  }
};

const putUserGreetings = async(discordId, greetingsObj) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}/greetings`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        ...authHeaderObj,
      },
      body: JSON.stringify({
        greetings: greetingsObj
      })
    });

    return await response.json();
  } catch (err) {
    errorHandler(err);
  }
};

const deleteUserGreetings = async(discordId, greetingsObj) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/users/${discordId}/greetings`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaderObj,
      },
      body: JSON.stringify({
        greetings: greetingsObj
      })
    });

    return await response.json();
  } catch (err) {
    errorHandler(err);
  }
};

/* GUILDS */

const getGuild = async (guildDiscordId) => {
  try {
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/guilds/${guildDiscordId}`, {
      method: 'GET'
    });

    return await response.json();
  } catch (err) {
    errorHandler(err);
  }
};

/* BANS */
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

/* POSITIONS */

const getUserPositions = async (discordId, { ticker }, enrichData = true) => {
  try {
    if (!discordId || !isDiscordId(discordId)) return { error: `invalid discordId: ${discordId}` };
    let queryParams = `?enrichData=${enrichData}`;
    if (ticker && ticker !== 'all') queryParams += `&ticker=${ticker}`;
    const response = await fetch(
      `${PASTRAMI_API_ENDPOINT}/positions/${discordId}${queryParams}`, {
        method: 'GET',
        headers: authHeaderObj,
      });

    const result = await response.json();

    return result;
  } catch (err) {
    errorHandler(err);
  }
};

/* TRANSACTIONS */

// limit: max number of transactions to query for
const getUserTransactions = async (discordId, limit) => {
  try {
    if (!discordId || !isDiscordId(discordId))
      return { error: `invalid discordId: ${discordId}` };
    if (limit && typeof limit !== 'number') 
      return { error: `invalid limit: ${limit}` };

    const queryString = limit ? `?limit=${limit}` : '';
    const response = await fetch(`${PASTRAMI_API_ENDPOINT}/transactions/${discordId}${queryString}`, {
      method: 'GET',
      headers: authHeaderObj,
    });

    return await response.json();
  } catch (err) {
    errorHandler(err);
  }
};

/* CLAIMS */

const makeAllUserClaims = async (discordId) => {
  try {
    if (!discordId || !isDiscordId(discordId)) return { error: `invalid discordId: ${discordId}` };
    const response = await fetch(
      `${PASTRAMI_API_ENDPOINT}/claim/all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaderObj
        },
        body: JSON.stringify({
          discordId
        }),
      });

    const result = await response.json();

    return result;
  } catch (err) {
    errorHandler(err);
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
  deleteUserGreetings,
  getUserPositions,
  getUserTransactions,
  makeAllUserClaims,
}
