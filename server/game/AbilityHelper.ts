import { AbilityLimitInstance } from './core/ability/AbilityLimit';
import Effects from './ongoingEffects/OngoingEffectLibrary';
import * as GameSystems from './gameSystems/GameSystemLibrary';
import StateWatcherLibrary from './stateWatchers/StateWatcherLibrary';
import * as Costs from './costs/CostLibrary.js';
import type Game from './core/Game';

export interface IAbilityHelper extends IStaticAbilityHelper {
    limit: AbilityLimitInstance;
}

export interface IStaticAbilityHelper {
    ongoingEffects: typeof Effects;
    costs: typeof Costs;
    immediateEffects: typeof GameSystems;
    stateWatchers: typeof StateWatcherLibrary;
}

export class AbilityHelperInstance {
    private readonly game: Game;

    public readonly limit: AbilityLimitInstance;
    public readonly ongoingEffects = Effects;
    public readonly costs = Costs;
    public readonly immediateEffects = GameSystems;
    public readonly stateWatchers = StateWatcherLibrary;

    public constructor(game: Game) {
        this.game = game;
        this.limit = new AbilityLimitInstance(game);
    }
}

export const StaticAbilityHelper: IStaticAbilityHelper = { ongoingEffects: Effects, costs: Costs, immediateEffects: GameSystems, stateWatchers: StateWatcherLibrary };

export const getAbilityHelper = (game: Game) => {
    const limit = new AbilityLimitInstance(game);
    return ({ limit: limit, ongoingEffects: Effects, costs: Costs, immediateEffects: GameSystems, stateWatchers: StateWatcherLibrary }) satisfies IAbilityHelper;
};