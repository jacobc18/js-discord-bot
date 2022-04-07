const { isDiscordId } = require('../../utils/regexHelpers');
const joinArgsByQuotes = require('../../utils/joinArgsByQuotes');
const {
  getUser,
  postNewUser,
  putUserGreetings
} = require('../../services/pastramiApi')


// args input should be treated as pairs of [key, value] after index 0 which should be the users discordId
// - ex: ['userIdHere', '*', 'greeting 1', '5/1/*', 'greeting 2']
// - => {'*': ['greeting 1'], '5/1/*': ['greeting 2']} for discordId 'userIdHere'
const greetingsAdd = async(message, args) => {
  const discordId = args[0];

  if (!isDiscordId(discordId)) {
    await message.channel.send(`invalid user discordId: ${discordId}`);
    return;
  }

  const apiUser = await tryGetUser(message, discordId);
  if (apiUser.error) return;

  const joinedArgs = joinArgsByQuotes(args.slice(1));

  const greetings = {};
  for (let i = 0; i < joinedArgs.length; i = i + 2) {
    const key = joinedArgs[i];
    const value = joinedArgs[i + 1];
    if (!key || !value) {
      await message.channel.send(`failed to add [key, value] pair: [${key}: ${value}] from indices: [${i}, ${i + 1}]`);
      return;
    }

    if (greetings[key]) {
      greetings[key].push(value);
    } else {
      greetings[key] = [value];
    }
  }

  const response = await putUserGreetings(discordId, greetings);
  if (response.error) {
    await message.channel.send(`greetings add failed for discordId: ${discordId}, err: ${response.error}`);
    return;
  }

  await message.channel.send(`successfully added greetings for input: [${args}]`);
};

// TODO
const greetingsDelete = async(message, args) => {
  await message.channel.send('!admin g delete WIP');
};

// gets user data from api and if it doesn't exist, creates a new user
const tryGetUser = async(message, discordId) => {
  // check to see if user already exists
  const apiUser = await getUser(discordId);
  if (apiUser.error) {
    // user probably doesn't exist in db, create new user
    const newUser = await postNewUser(discordId);
    if (newUser.error) {
      await message.channel.send(`new user creation failed for ${discordId}, err: ${newUser.error}`);
      return newUser;
    }

    return newUser;
  }

  return apiUser;
};

module.exports = {
  greetingsAdd,
  greetingsDelete
};
