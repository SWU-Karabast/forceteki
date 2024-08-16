import PlayerOrCardAbility from './PlayerOrCardAbility';
import type Card from '../card/Card';
import { Aspect, Location, PlayType, Stage } from '../Constants';
import OngoingEffectSource from '../ongoingEffect/OngoingEffectSource';
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
export class AbilityContext<TSource = any> {
    public game: Game;
    public source: TSource;
    public player: Player;
    public ability: PlayerOrCardAbility;
    public costs: any;
    public costAspects: Aspect[];
    public targets: any;
    public selects: any;
    public tokens: any;
    public events: any[] = [];
    public stage: Stage;
    public targetAbility: any;
    public target: any;
    public select: string;
    public subResolution = false;
    public choosingPlayerOverride: Player = null;
    public gameActionsResolutionChain: GameSystem[] = [];
    public playType: PlayType;
    public cardStateWhenInitiated: any = null;

    public constructor(properties: IAbilityContextProperties) {
        this.game = properties.game;
        this.source = properties.source || new OngoingEffectSource(this.game);
        this.player = properties.player;
        this.ability = properties.ability || new PlayerOrCardAbility({});
        this.costs = properties.costs || {};
        this.costAspects = properties.costAspects || [];
        this.targets = properties.targets || {};
        this.selects = properties.selects || {};
        this.tokens = properties.tokens || {};
        this.stage = properties.stage || Stage.EffectTmp;
        this.targetAbility = properties.targetAbility;
        // const location = this.player && this.player.playableLocations.find(location => location.contains(this.source));
        this.playType = this.player && this.player.findPlayType(this.source); //location && location.playingType;
    }

    public copy(newProps: Partial<IAbilityContextProperties>): AbilityContext<this> {
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

    public createCopy(newProps: Partial<IAbilityContextProperties>): AbilityContext<this> {
        return new AbilityContext(Object.assign(this.getProps(), newProps));
    }

    public getProps(): IAbilityContextProperties {
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
