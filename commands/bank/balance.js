const logger = require('../../utils/logger');
const getDateTimeStringLocal = require('../../utils/getDateTimeStringLocal');

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
        if (!bankData.user_ledger[userId]) {
            bankData.audit_log[timestampString] = `${userName} has requested their balance, but has no Cullivery account.`;
            outputStr = `You don't have a balance because you don't have a Cullivery account!\n` +
                `Type "!claim" to open a Cullivery account.`;
        }
        else {
            let userBalance = bankData.user_ledger[userId].balance;
            bankData.audit_log[timestampString] = `${userName} has requested their balance: ${userBalance}`;
            outputStr = `You have ${userBalance} Culliverys in your Cullivery account.`;
        }

        await message.channel.send(`${outputStr}`);
    }
};