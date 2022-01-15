require('../utils/getDotenv');

const log = data => {
    if (!process.env.LOGGING) return;

    console.log(Date(), `<${data}>`);
};

module.exports = {
    log
};
