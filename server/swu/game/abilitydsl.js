const AbilityLimit = require('./AbilityLimit');
const Effects = require('./core/effect/effects.js');
const Costs = require('./costs/CostLibrary.js');
const GameActions = require('./gameSystems/GameSystems');

const AbilityDsl = {
    limit: AbilityLimit,
    effects: Effects,
    costs: Costs,
    actions: GameActions
};

module.exports = AbilityDsl;
