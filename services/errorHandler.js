require('../utils/getDotenv');
const NODE_ENV = process.env.NODE_ENV;
const logger = require('../utils/logger');

const isProduction = NODE_ENV.includes('production');

const errorHandler = (error) => {
    if (!error) logger.log('empty error received');

    if (isProduction) throw error;

    logger.log(error.message);
};

module.exports = {
    errorHandler,
};