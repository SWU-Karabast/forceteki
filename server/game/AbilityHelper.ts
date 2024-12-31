import * as AbilityLimit from './core/ability/AbilityLimit';
import Effects from './ongoingEffects/OngoingEffectLibrary';
import * as GameSystems from './gameSystems/GameSystemLibrary';
import StateWatcherLibrary from './stateWatchers/StateWatcherLibrary';
import * as Costs from './costs/CostLibrary.js';

export = {
    limit: AbilityLimit,
    ongoingEffects: Effects,
    costs: Costs,
    immediateEffects: GameSystems,
    stateWatchers: StateWatcherLibrary
};
