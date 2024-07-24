const AbilityLimit = require('./AbilityLimit');
const Effects = require('./effects/effects.js');
const Costs = require('./costs/Costs.js');
const GameActions = require('./gameActions/GameActions');

const AbilityDsl = {
    limit: AbilityLimit,
    effects: Effects,
    costs: Costs,
    actions: GameActions
};

module.exports = AbilityDsl;
