const logger = require('../../utils/logger');
const getDateTimeStringLocal = require('../../utils/getDateTimeStringLocal');
const fs = require('fs');

module.exports = {
    data: {
        name: 'balance',
        type: 'text'
    },
    async execute(message) {
        const guildId = message.guildId;
        const bankData = require('../../data/bank.json');
        
        logger.log(`!claim user: ${message.member.user.username} | guildId: ${guildId}`);
        
        let outputStr = '';
        let userId = message.member.user.id;
        let userName = message.member.user.username;
        let timestampString = getDateTimeStringLocal();
        if (!bankData.userLedger[userId]) {
            bankData.auditLog[timestampString] = `${userName} has requested their balance, but has no Kolaveri account.`;
            outputStr = `You don't have a balance because you don't have a Kolaveri account!\n` +
                `Type "!claim" to open a Kolaveri account.`;
        } else {
            let userBalance = bankData.userLedger[userId].balance;
            bankData.auditLog[timestampString] = `${userName} has requested their balance: ${userBalance}`;
            outputStr = `You have ${userBalance} Kolaveries in your Kolaveri account.`;
        }

        fs.writeFileSync('./data/bank.json', JSON.stringify(bankData, null, 4));
        
        await message.channel.send(`${outputStr}`);
    }
};