import * as AbilityLimit from './core/ability/AbilityLimit';
import Effects from './ongoingEffects/OngoingEffectLibrary';
import * as Costs from './costs/CostLibrary.js';
import * as GameSystems from './gameSystems/GameSystemLibrary';

export = {
    limit: AbilityLimit,
    ongoingEffects: Effects,
    costs: Costs,
    immediateEffects: GameSystems
};
