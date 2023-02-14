const logger = require('../utils/logger');

const errorHandler = (error) => {
    logger.log(error.message);
};

module.exports = {
    errorHandler,
};