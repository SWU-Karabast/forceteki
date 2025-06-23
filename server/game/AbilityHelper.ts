import Effects from './ongoingEffects/OngoingEffectLibrary';
import * as GameSystems from './gameSystems/GameSystemLibrary';
import StateWatcherLibrary from './stateWatchers/StateWatcherLibrary';
import * as Costs from './costs/CostLibrary.js';
import type { AbilityLimitInstance } from './core/ability/AbilityLimit';

export = {
    // HACK: Game will set this after it is created.
    limit: null as AbilityLimitInstance,
    ongoingEffects: Effects,
    costs: Costs,
    immediateEffects: GameSystems,
    stateWatchers: StateWatcherLibrary
};