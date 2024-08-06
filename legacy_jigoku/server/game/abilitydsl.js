const AbilityLimit = require('./AbilityLimit');
const Effects = require('./effects.js');
const Costs = require('./Costs.js');
const GameActions = require('./GameActions/GameActions');

const AbilityDsl = {
    limit: AbilityLimit,
    effects: Effects,
    costs: Costs,
    actions: GameActions
};

module.exports = AbilityDsl;
