const { authResolver } = require('./auth');
const { eventResolver } = require('./event');
const { bookingResolver } = require('./booking');

const resolvers = {
    ...authResolver,
    ...eventResolver,
    ...bookingResolver,
};

module.exports = { resolvers };
