const fetch = require('node-fetch');
const logger = require('../utils/logger');

const PASTRAMI_API_ENDPOINT = 'http://pastramiapi-env.eba-eemspvyp.us-east-1.elasticbeanstalk.com';

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

const getTotal69s = async(discordId) => {
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

module.exports = {
  getUsers,
  getUser69Check,
  getTotal69s,
  postNewUser
}
