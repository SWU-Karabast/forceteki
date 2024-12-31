import type PlayerOrCardAbility from './PlayerOrCardAbility';
import type { Aspect, PlayType } from '../Constants';
import { Stage } from '../Constants';
import { OngoingEffectSource } from '../ongoingEffect/OngoingEffectSource';
import type Game from '../Game';
import type { GameSystem } from '../gameSystem/GameSystem';
import type Player from '../Player';
import type { Card } from '../card/Card';

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
    playType?: PlayType;
}

/**
 * Data class that wraps relevant game state for the execution of a PlayerOrCardAbility.
 * While the structure will vary from inheriting classes, it is guaranteed to have at least the `game` object, the
 * `player` that is executing the action, and the `source` card object that the ability is generated from.
 */
export class AbilityContext<TSource extends Card = Card> {
    public game: Game;
    public source: TSource;
    public player: Player;
    public ability: PlayerOrCardAbility;
    public costs: any;
    public costAspects: Aspect[];
    public targets: any;
    public selects: any;
    public events: any[] = [];
    public stage: Stage;
    public targetAbility: any;
    public target: any;
    public select: string;
    public subResolution = false;
    public choosingPlayerOverride: Player = null;
    public gameActionsResolutionChain: GameSystem[] = [];
    public playType?: PlayType;
    public cardStateWhenInitiated: any = null;

    public constructor(properties: IAbilityContextProperties) {
        this.game = properties.game;
        this.source = properties.source || new OngoingEffectSource(this.game);
        this.player = properties.player;
        this.ability = properties.ability || null;
        this.costs = properties.costs || {};
        this.costAspects = properties.costAspects || [];
        this.targets = properties.targets || {};
        this.selects = properties.selects || {};
        this.stage = properties.stage || Stage.Effect;
        this.targetAbility = properties.targetAbility;
        // const zone = this.player && this.player.playableZones.find(zone => zone.contains(this.source));

        this.playType = this.ability?.isPlayCardAbility()
            ? properties.playType ?? (this.player && this.player.findPlayType(this.source))
            : null;
    }

    public copy(newProps: Partial<IAbilityContextProperties> = {}): AbilityContext<TSource> {
        const copy = this.createCopy(newProps);
        copy.target = this.target;
        copy.costAspects = this.costAspects;
        copy.select = this.select;
        copy.subResolution = this.subResolution;
        copy.choosingPlayerOverride = this.choosingPlayerOverride;
        copy.gameActionsResolutionChain = this.gameActionsResolutionChain;
        copy.playType = this.playType;
        return copy;
    }

    public createCopy(newProps: Partial<IAbilityContextProperties>) {
        return new AbilityContext<TSource>(Object.assign(this.getProps(), newProps));
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
            events: this.events,
            stage: this.stage,
            targetAbility: this.targetAbility
        };
    }
}
