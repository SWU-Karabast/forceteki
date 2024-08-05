const AbilityLimit = require('./AbilityLimit');
const Effects = require('./effects/EffectLibrary.js');
const Costs = require('./costs/CostLibrary.js');
const GameSystems = require('./gameSystems/GameSystemLibrary');

const AbilityDsl = {
    limit: AbilityLimit,
    ongoingEffects: Effects,
    costs: Costs,
    immediateEffects: GameSystems
};

module.exports = AbilityDsl;
