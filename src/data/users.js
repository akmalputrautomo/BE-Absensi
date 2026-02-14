let users = [];
let idCounter = 1;

const getNextId = () => idCounter++;

module.exports = { users, getNextId };
