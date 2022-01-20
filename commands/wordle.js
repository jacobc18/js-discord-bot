const NODE_ENV = process.env.NODE_ENV;
const isProduction = NODE_ENV.includes('production');

const fs = require('fs');
const { MessageEmbed } = require('discord.js');
const users = require('../data/users.json');
const readFile = require('../utils/readFile');
const logger = require('../utils/logger');

const USERS_FILEPATH_FROM_INDEX = './data/users.json';
const WORDLE_VALID_GUESSES_FILEPATH = './data/wordle/validguesses.txt';
// const WORDLE_ANSWERS_FILEPATH = './data/wordle/answers.txt';
const WORDLE_ANSWERS_FILEPATH = './data/wordle/test_answers.txt';

const ABSENT_LETTER = 'absent';
const PRESENT_LETTER = 'present';
const CORRECT_LETTER = 'correct';
const UNKNOWN_LETTER = 'unknown';
// const ABSENT_EMOJI = '⬛';
const ABSENT_EMOJI = '⬜';
const PRESENT_EMOJI = '🟨';
const CORRECT_EMOJI = '🟩';
const UNKNOWN_EMOJI = '❔';

const MAX_GUESSES_ALLOWED = 6;

const FIRST_WORDLE_DATE = '2021-06-18';
const DAY_MS = 86400000;

module.exports = {
  data: {
    name: 'wordle',
    type: 'text'
  },
  aliases: ['w'],
  async execute(message, args) {
    const guildId = message.guildId; // null if a DIRECT MESSAGE
    const userId = message.author.id;

    if (!users[userId] || !users[userId].wordle) {
      // create base wordle data in users
      let cUser = users[userId] || {};
      updateJsonFileElementSync(USERS_FILEPATH_FROM_INDEX, users, `${userId}`,
        {
          ...cUser,
          wordle: {
            answer: null,
            answerIdx : null,
            answerIdxOffset: 0,
            guesses: [],
            stats: {
              solvedScores: {0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[]},
              played: 0,
              wins: 0,
              streak: 0,
              maxStreak: 0
            }
          }
        }
      );

      await message.author.send(`I see this is your first time playing! Use **!wordle help** to see a full list of !wordle commands. You can also use !w instead of !wordle for any command. Good luck!`);
    }

    logger.log(`!WORDLE ${args} user: ${message.author.username} | ${guildId ? `guildId: ${guildId}` : 'DIRECT_MESSAGE'}`);

    if (args.length > 0 && (args[0] === 'stats' || args[0] === 's')) {
      let lookupId = userId;
      if (args.length > 1) {
        lookupId = args[1].replace(/[\\<>@#&!]/g, "");
      }

      if (!users[lookupId] || !users[lookupId].wordle) {
        await message.reply(`User <@!${lookupId}> does not have any wordle stats!`);
        return;
      }

      const lookupWordle = users[lookupId].wordle;
      if (!lookupWordle.stats) {
        // this should not happen
        await message.reply(`User <@!${lookupId}> does not have any wordle stats! (ERROR)`);
        throw new Error(`no wordle status for user: ${lookupId}`);
      }

      await message.reply(getWordleStatsMessage(lookupId, lookupWordle.stats));
      return;
    }

    if (guildId) {
      await message.reply('To play Wordle send !wordle as a direct message to me');
      return;
    }

    const user = users[userId];
    const userWordle = user.wordle;

    if (!userWordle.answer && (args.length === 0 || args[0] === 'start')) {
      // not on word currently, start a new game
      const wordleDayOne = new Date(FIRST_WORDLE_DATE);
      const today = new Date();
      let answerWordleIdx = Math.floor((today - wordleDayOne)  / DAY_MS);

      // add offset if not in production
      if (!isProduction) {
        answerWordleIdx += userWordle.answerIdxOffset
      }

      let answerWord = '';
      let count = 0;
      await readFile(WORDLE_ANSWERS_FILEPATH, (line, closeFile) => {
          count++;
          if (count === answerWordleIdx) {
            answerWord = line;
            closeFile();
          }
      });

      // check if they've already played this word
      if (indexIsInSolvedScores(userWordle.stats.solvedScores, answerWordleIdx)) {
        await message.author.send(`You've already played Wordle #${answerWordleIdx}. Please wait until tomorrow to play the next one! (Try **!wordle help** for a list of !wordle commands)`);
        return;
      }

      updateJsonFileElementSync(USERS_FILEPATH_FROM_INDEX, users, userId, {
        ...user,
        wordle: {
          ...userWordle,
          answer: answerWord,
          answerIdx: answerWordleIdx
        }
      });

      await message.author.send(`Wordle #${answerWordleIdx} started!\nReply with command **!wordle guess *guess*** to make your guess.`);
      return;
    } else if (args.length === 0 || args[0] === 'start') {
      await message.author.send(`You are currently on Wordle #${userWordle.answerIdx} with ${userWordle.guesses.length} guesses so far.\nPlease use command **!wordle guess *guess*** to make your next guess.\nUse **!wordle quit** to quit your current word (#${userWordle.answerIdx}). ❗**WARNING**❗ This will be recorded as a failure.\nUse **!wordle help** for a full list of !wordle commands.`);
      
      if (userWordle.guesses.length > 0) {
        const fullResultsString = getFullWordleOutputString(userWordle);
        await message.author.send(fullResultsString);
      }

      return;
    } else if (args[0] === 'help') {
      const embed = new MessageEmbed()
        .setColor('#538d4e')
        .setTitle('!wordle commands')
        .setURL('https://github.com/jacobc18/js-discord-bot#readme')
        .setDescription('A full list of !wordle commands. Tip: you can use !w instead of !wordle')
        .addFields(
            { name: '!wordle howtoplay', value: 'displays instructions on how to play Wordle' },
            { name: '!wordle help', value: 'displays this command list' },
            { name: '!wordle stats', value: 'displays your Wordle stats. Alias: !wordle s' },
            { name: '!wordle stats *user tag*', value: 'displays the Wordle stats of the given user if they exist. Must be done in a guild channel. Alias: !wordle s *user tag*' },
            { name: '!wordle guess *guess*', value: 'submits *guess* as a Wordle guess. Only possible if currently in a Wordle game. Alias: !wordle g *guess*' },
            { name: '!wordle quit', value: 'quits your current Wordle word. This results in a recorded failure. Only possible if currently in a Wordle game' },
            { name: '!wordle | !wordle start', value: 'starts a Wordle game with today\'s word if you are not currently in one. Otherwise displays helpful info' },
            { name: '!report *message*', value: 'reports given message to the bot owner. Thanks for your help!' }
        );
      await message.author.send({
        embeds: [embed]
      });
      return;
    } else if (args[0] === 'quit') {
      // todo: add an "are you sure?" confirmation message
      const newSolvedScores = userWordle.stats.solvedScores;
      newSolvedScores['0'] = [...newSolvedScores['0'], `${userWordle.answerIdx}`];
      updateJsonFileElementSync(USERS_FILEPATH_FROM_INDEX, users, userId, {
        ...user,
        wordle: {
          ...userWordle,
          answer: null,
          answerIdx: null,
          guesses: [],
          stats: {
            ...userWordle.stats,
            played: userWordle.stats.played + 1,
            streak: 0,
            solvedScores: newSolvedScores
          }
        }
      });

      await message.author.send(`Successfully quit Wordle #${userWordle.answerIdx} and recorded as a failure. The answer was "${userWordle.answer}"`);
      return;
    } else if (args[0] === 'howtoplay') {
      await message.author.send('this message is currently a work in progress. See the official Wordle website for instructions on how to play: https://www.powerlanguage.co.uk/wordle/');
      return;
    } else if (args[0] === 'next') {
      if (isProduction) {
        await message.author.send('This command is not available in the production environment!');
        return;
      }

      if (userWordle.answer) {
        await message.author.send(`Please finish your current Wordle game #${userWordle.answerIdx} to use **!wordle next**`);
        return;
      }

      updateJsonFileElementSync(USERS_FILEPATH_FROM_INDEX, users, userId, {
        ...user,
        wordle: {
          ...userWordle,
          answerIdxOffset: userWordle.answerIdxOffset + 1
        }
      });
      await message.author.send(`I've successfully updated your day offset to be ${userWordle.answerIdxOffset + 1}! Use **!wordle** or **!w** to start a game at the new day.`);
      return;
    } else if (args[0] === 'guess' || args[0] === 'g') {
      if (!userWordle.answer) {
        await message.author.send(`You are not currently in a Wordle game! Use **!wordle** or **!wordle start** to start a game!`);
        return;
      }

      if (args.length < 2) {
        await message.author.send(`Make sure you enter a guess! (!wordle guess *guess*)`);
        return;
      }

      let badInput = false;
      const guess = args[1].toLowerCase();
      if (args.length > 2) {
        await message.author.send(`You've submitted more than one guess argument. I'm using the first argument "${guess}" as your guess.`);
      }

      if (guess.length !== 5) {
        badInput = true;
        await message.author.send(`Your guess must 5 characters long!`);
      }

      if (!/^[a-zA-Z]+$/.test(guess)) {
        badInput = true;
        await message.author.send('Your guess must only contain English letters!');
      }

      if (badInput) {
        return;
      }

      if (userWordle.guesses.includes(guess)) {
        await message.author.send('You have already guessed that!');
        return;
      }

      //check guess validity against valid guesses
      let foundMatch = false;
      await readFile(WORDLE_VALID_GUESSES_FILEPATH, (line, closeFile) => {
        if (line === guess) {
          foundMatch = true;
          closeFile();
        }
      });

      if (!foundMatch) {
        await message.author.send('That is not a valid 5 letter guess!');
        return;
      }

      let newUserWordle = {
        ...userWordle,
        guesses: [...userWordle.guesses, guess]
      };

      const fullResultsString = getFullWordleOutputString(newUserWordle);
      await message.author.send(fullResultsString);

      const numGuesses = newUserWordle.guesses.length;

      // correct guess!
      if (guess === userWordle.answer) {
        const newSolvedScores = {
          ...userWordle.stats.solvedScores,
          [numGuesses]: [...userWordle.stats.solvedScores[numGuesses], `${userWordle.answerIdx}`]
        }
        newUserWordle = {
          ...userWordle,
          answer: null,
          answerIdx: null,
          guesses: [],
          stats: {
            ...userWordle.stats,
            played: userWordle.stats.played + 1,
            wins: userWordle.stats.wins + 1,
            streak: userWordle.stats.streak + 1,
            maxStreak: Math.max(userWordle.stats.streak + 1, userWordle.stats.maxStreak),
            solvedScores: newSolvedScores
          }
        }

        await message.author.send(`You guessed the correct word "${userWordle.answer}" in ${numGuesses} guess${numGuesses === 1 ? '' : 'es'}! (use !wordle stats to view your overall stats)`);
      } else if (numGuesses === MAX_GUESSES_ALLOWED) {
        // failed to guess the word :(
        const newSolvedScores = {
          ...userWordle.stats.solvedScores,
          ['0']: [...userWordle.stats.solvedScores['0'], `${userWordle.answerIdx}`]
        }
        newUserWordle = {
          ...userWordle,
          answer: null,
          answerIdx: null,
          guesses: [],
          stats: {
            ...userWordle.stats,
            played: userWordle.stats.played + 1,
            solvedScores: newSolvedScores
          }
        }

        await message.author.send(`Oh no! You failed to guess the correct word "${userWordle.answer}" in ${MAX_GUESSES_ALLOWED} guesses. (use !wordle stats to view your overall stats)`);
      }

      updateJsonFileElementSync(USERS_FILEPATH_FROM_INDEX, users, userId, {
        ...user,
        wordle: newUserWordle
      });

      return;
    }

    await message.author.send('I don\'t recognize that !wordle command. Try **!wordle help** for a list of !wordle commands.');
  }
};

const buildKeyboardResultsString = (letterPresences) => {
  let outputStr = `${CORRECT_EMOJI}: ${letterPresences[CORRECT_LETTER].sort().join('')}\n`;
  outputStr += `${PRESENT_EMOJI}: ${letterPresences[PRESENT_LETTER].sort().join('')}\n`;
  outputStr += `${ABSENT_EMOJI}: ${letterPresences[ABSENT_LETTER].sort().join('')}\n`;
  outputStr += `${UNKNOWN_EMOJI}: ${letterPresences[UNKNOWN_LETTER].sort().join('')}\n`;
  return outputStr;
};

const getFullWordleOutputString = (userWordle) => {
  let outputStr = '```';
  outputStr += `Wordle #${userWordle.answerIdx} ${userWordle.guesses.length}/${MAX_GUESSES_ALLOWED}\n\n`;
  const [fullResultsString, letterPresences] = getAllGuessResultsEmojiStringAndLetterPresences(userWordle);
  outputStr += buildKeyboardResultsString(letterPresences) + '\n';
  outputStr += fullResultsString;
  return outputStr + '```';
};

const updateLetterPresences = (currPresences, guess, guessResults) => {
  let resultPresences = currPresences;
  for (let i = 0; i < guess.length; ++i) {
    const letter = guess[i];
    const letterResult = guessResults[i];
    if (letterResult === CORRECT_LETTER && !currPresences[`${CORRECT_LETTER}`].includes(letter)) {
      resultPresences[`${CORRECT_LETTER}`].push(letter);
      const presentLetterIdx = currPresences[`${PRESENT_LETTER}`].indexOf(letter);
      const unknownLetterIdx = currPresences[`${UNKNOWN_LETTER}`].indexOf(letter);
      if (presentLetterIdx > -1) {
        resultPresences[`${PRESENT_LETTER}`].splice(presentLetterIdx, 1);
      } else if (unknownLetterIdx > -1) {
        resultPresences[`${UNKNOWN_LETTER}`].splice(unknownLetterIdx, 1);
      }
    } else if (letterResult === PRESENT_LETTER && !currPresences[`${PRESENT_LETTER}`].includes(letter)) {
      resultPresences[`${PRESENT_LETTER}`].push(letter);
      const unknownLetterIdx = currPresences[`${UNKNOWN_LETTER}`].indexOf(letter);
      if (unknownLetterIdx > -1) {
        // should always be true
        resultPresences[`${UNKNOWN_LETTER}`].splice(unknownLetterIdx, 1);
      }
    } else if (letterResult === ABSENT_LETTER && !currPresences[`${ABSENT_LETTER}`].includes(letter)) {
      resultPresences[`${ABSENT_LETTER}`].push(letter);
      const unknownLetterIdx = currPresences[`${UNKNOWN_LETTER}`].indexOf(letter);
      if (unknownLetterIdx > -1) {
        // should always be true
        resultPresences[`${UNKNOWN_LETTER}`].splice(unknownLetterIdx, 1);
      }
    }
  }

  return resultPresences;
};

const getAllGuessResultsEmojiStringAndLetterPresences = (userWordle) => {
  let outputStr = '';
  let letterPresences = {
    [ABSENT_LETTER]: [],
    [PRESENT_LETTER]: [],
    [CORRECT_LETTER]: [],
    [UNKNOWN_LETTER]: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  };
  for (let g of userWordle.guesses) {
    const guessResults = getGuessResults(g, userWordle.answer);
    letterPresences = updateLetterPresences(letterPresences, g, guessResults);
    const guessResultsEmojiString = getGuessResultsEmojiString(guessResults);
    outputStr += `${guessResultsEmojiString} ${g}\n`;
  }

  return [outputStr, letterPresences];
};

const getGuessResultsEmojiString = (guessResults) => {
  let result = '';
  for (let g of guessResults) {
    switch (g) {
      case ABSENT_LETTER: result += ABSENT_EMOJI; break;
      case PRESENT_LETTER: result += PRESENT_EMOJI; break;
      case CORRECT_LETTER: result += CORRECT_EMOJI; break;
    }
  }

  return result;
};

const getGuessResults = (guess, answer) => {
  let answerLetters = answer.split('');
  const results = new Array(5).fill(ABSENT_LETTER);
  // handle correct letters first, this helps deal with cases when there are duplicate letters
  for (let i = 0; i < answer.length; ++i) {
    if (guess[i] === answer[i]) {
      results[i] = CORRECT_LETTER;
      answerLetters.shift();
    }
  }

  for (let i = 0; i < answer.length; ++i) {
    const guessChar = guess[i];
    const answerChar = answer[i];
    if (guessChar !== answerChar && answerLetters.includes(guessChar)) {
      results[i] = PRESENT_LETTER;
    }
  }

  return results;
};

const indexIsInSolvedScores = (solvedScores, wordIdx) => {
  const flatSolvedVals = Object.values(solvedScores).flat();
  return flatSolvedVals.includes(`${wordIdx}`);
};

const updateJsonFileElementSync = (filePath, jsonData, key, value) => {
  jsonData[key] = value;
  fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
};

const getWordleStatsMessage = (userId, wordleStats) => {
  const quickChartIOHost = 'https://quickchart.io/chart?c=';
  const solvedScoresVals = Object.values(wordleStats.solvedScores);
  const valsLengths = solvedScoresVals.map(scores => scores.length);
  const chart = {
    type: 'bar',
    data: {
        labels: ['Failures',1,2,3,4,5,6],
        datasets: [
            {
                label: 'Games',
                data: valsLengths,
                backgroundColor: ["%2301FF70", "%2301FF70", "%2301FF70", "%2301FF70", "%2301FF70", "%2301FF70", "%2301FF70"]
            }
        ]
    }
  };
  const chartImgURL = `${quickChartIOHost}${JSON.stringify(chart)}`;

  const embed = new MessageEmbed()
    .setColor('#538d4e')
    .setTitle('Wordle stats')
    .setURL('https://github.com/jacobc18/js-discord-bot#readme')
    .addFields(
        { name: 'played', value: `${wordleStats.played}`, inline: true},
        { name: 'wins', value: `${wordleStats.wins}`, inline: true },
        { name: 'win %', value: `${wordleStats.wins / wordleStats.played * 100}`, inline: true },
        { name: 'current streak', value: `${wordleStats.streak}`, inline: true },
        { name: 'max streak', value: `${wordleStats.maxStreak}`, inline: true},
    )
    .setImage(chartImgURL);

  let outputStr = '```Guess Distribution:\n';
  outputStr += `Guess  | Total | Wordle IDs\n`;
  outputStr += '-------|-------|--------------------------------------\n'; // length 54

  for (let i = 0; i < solvedScoresVals.length; ++i) {
    outputStr += `   ${i > 0 ? i : 'F'}   |${`${valsLengths[i]}`.padStart(6)} | `;
    let nextOutputSegment = '';
    const wordleIds = solvedScoresVals[i];
    for (let j = 0; j < wordleIds.length; ++j) {
      const wordleId = wordleIds[j];
      const nextIdStr = j === wordleIds.length - 1 ? `${wordleId}` : `${wordleId}, `;
      if (nextOutputSegment.length + nextIdStr.length > 38) {
        outputStr += nextOutputSegment;
        nextOutputSegment = `\n${' '.padEnd(7)}|${' '.padEnd(7)}| `;
      }
      nextOutputSegment += `${nextIdStr}`;
    }
    outputStr += `${nextOutputSegment}\n`;
  }

  outputStr += '```';

  return {
    content: `${outputStr}`,
    embeds: [embed]
  };
}