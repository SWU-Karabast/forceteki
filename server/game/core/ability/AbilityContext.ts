import PlayerOrCardAbility from './PlayerOrCardAbility';
import type Card from '../card/Card';
import { Aspect, Location, PlayType, Stage } from '../Constants';
import EffectSource from '../effect/EffectSource';
import type Game from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import type Player from '../Player';
// import type { StatusToken } from './StatusToken';

export interface IAbilityContextProperties {
    game: Game;
    source?: any;
    player?: Player;
    ability?: PlayerOrCardAbility;
    costs?: any;
    costAspects?: Aspect[];
    targets?: any;
    selects?: any;
    tokens?: any;
    events?: any[];
    stage?: Stage;
    targetAbility?: any;
}

/**
 * Data class that wraps relevant game state for the execution of a PlayerOrCardAbility.
 * While the structure will vary from inheriting classes, it is guaranteed to have at least the `game` object, the
 * `player` that is executing the action, and the `source` card object that the ability is generated from.
 */
export class AbilityContext<S = any> {
    game: Game;
    source: S;
    player: Player;
    ability: PlayerOrCardAbility;
    costs: any;
    costAspects: Aspect[];
    targets: any;
    selects: any;
    tokens: any;
    events: any[] = [];
    stage: Stage;
    targetAbility: any;
    target: any;
    select: string;
    // token: StatusToken;
    subResolution = false;
    choosingPlayerOverride: Player = null;
    gameActionsResolutionChain: GameSystem[] = [];
    playType: PlayType;
    cardStateWhenInitiated: any = null;

    constructor(properties: IAbilityContextProperties) {
        this.game = properties.game;
        this.source = properties.source || new EffectSource(this.game);
        this.player = properties.player;
        this.ability = properties.ability || new PlayerOrCardAbility({});
        this.costs = properties.costs || {};
        this.costAspects = properties.costAspects || [];
        this.targets = properties.targets || {};
        this.selects = properties.selects || {};
        this.tokens = properties.tokens || {};
        this.stage = properties.stage || Stage.Effect;
        this.targetAbility = properties.targetAbility;
        // const location = this.player && this.player.playableLocations.find(location => location.contains(this.source));
        this.playType = this.player && this.player.findPlayType(this.source); //location && location.playingType;
    }

    copy(newProps: Partial<IAbilityContextProperties>): AbilityContext<this> {
        const copy = this.createCopy(newProps);
        copy.target = this.target;
        // copy.token = this.token;
        copy.costAspects = this.costAspects;
        copy.select = this.select;
        copy.subResolution = this.subResolution;
        copy.choosingPlayerOverride = this.choosingPlayerOverride;
        copy.gameActionsResolutionChain = this.gameActionsResolutionChain;
        copy.playType = this.playType;
        return copy;
    }

    createCopy(newProps: Partial<IAbilityContextProperties>): AbilityContext<this> {
        return new AbilityContext(Object.assign(this.getProps(), newProps));
    }

    getProps(): IAbilityContextProperties {
        return {
            game: this.game,
            source: this.source,
            player: this.player,
            ability: this.ability,
            costs: Object.assign({}, this.costs),
            targets: Object.assign({}, this.targets),
            selects: Object.assign({}, this.selects),
            tokens: Object.assign({}, this.tokens),
            events: this.events,
            stage: this.stage,
            targetAbility: this.targetAbility
        };
    }
}
