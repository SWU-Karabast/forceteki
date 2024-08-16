const AbilityLimit = require('./core/ability/AbilityLimit');
const Effects = require('./ongoingEffects/EffectLibrary.js');
const Costs = require('./costs/CostLibrary.js');
const GameSystems = require('./gameSystems/GameSystemLibrary');

// UP NEXT: rename and convert to TS
const AbilityDsl = {
    limit: AbilityLimit,
    ongoingEffects: Effects,
    costs: Costs,
    immediateEffects: GameSystems
};

module.exports = AbilityDsl;
