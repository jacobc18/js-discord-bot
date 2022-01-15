let NODE_ENV = process.env.NODE_ENV;
if (NODE_ENV !== 'production' && NODE_ENV !== 'development') {
    NODE_ENV = 'development';
}
require('dotenv').config({ path: `./.env.${NODE_ENV}` });