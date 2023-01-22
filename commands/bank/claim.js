const logger = require('../../utils/logger');
const getDateTimeStringLocal = require('../../utils/getDateTimeStringLocal');
const getCooldownTimeRemaining = require('../../utils/getCooldownTimeRemaining');
const fs = require('fs');

module.exports = {
    data: {
        name: 'claim',
        type: 'text'
    },
	async execute(message) {
        const guildId = message.guildId;
        const bankData = require('../../data/bank.json');

        logger.log(`!claim user: ${message.member.user.username} | guildId: ${guildId}`);
        
        let outputStr = '';
        let userId = message.member.user.id;
        let userName = message.member.user.username;
        let timestamp = new Date().getTime();
        let timestampString = getDateTimeStringLocal();
        
        // If the user's id isn't in the ledger, add them and give them their initial balance
        if (!bankData.user_ledger[userId]) {
            let newUserEntry = {
                "balance": 30000,
                "last_claim_timestamp": timestamp
            }
            bankData.vault -= 30000;
            bankData.user_ledger[userId] = newUserEntry;
            bankData.audit_log[timestampString] = `${userName} has requested an allowance for the first time.`;
            outputStr = "Thanks for using Patrami\'s Global Bank of Culliverys!\n" +
                "I've added you to the ledger and dropped 30,000 Culliverys into your account!\n" +
                "You may claim an allowance every 24 hours.";
        }
        // else, check if user has claimed allowance in the last 24 hrs. Give them 10k if they can claim
        else if (timestamp >= bankData.user_ledger[userId].last_claim_timestamp + 86400000) {
            bankData.vault -= 10000;
            bankData.user_ledger[userId].balance += 10000;
            bankData.user_ledger[userId].last_claim_timestamp = timestamp;
            bankData.audit_log[timestampString] = `${userName} claimed a 10k allowance.`;
            outputStr = `10,000 Culliverys has been added to your balance.\n` +
                `You may claim another allowance no sooner than ${getDateTimeStringLocal(new Date(timestamp + 86400000))}`;
        }
        // otherwise, do nothing
        else {
            let cdTimeRemaining = getCooldownTimeRemaining(timestamp, bankData.user_ledger[userId].last_claim_timestamp);
            bankData.audit_log[timestampString] = `${userName} attempted to claim an allowance ${cdTimeRemaining} before their cooldown.`;
            outputStr = `You can claim your next allowance in ${cdTimeRemaining}.`;
        }

        fs.writeFileSync('./data/bank.json', JSON.stringify(bankData, null, 4));
        
        await message.channel.send(`${outputStr}`);
	}
};


