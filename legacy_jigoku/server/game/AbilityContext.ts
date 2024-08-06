import BaseAbility from './baseability';
import type BaseCard from './basecard';
import { Locations, PlayTypes, Stages } from './Constants';
import EffectSource from './EffectSource';
import type Game from './game';
import type { GameAction } from './GameActions/GameAction';
import type Player from './player';
import type Ring from './ring';
import type { StatusToken } from './StatusToken';

export interface AbilityContextProperties {
    game: Game;
    source?: any;
    player?: Player;
    ability?: BaseAbility;
    costs?: any;
    targets?: any;
    rings?: any;
    selects?: any;
    tokens?: any;
    elements?: any;
    events?: any[];
    stage?: Stages;
    targetAbility?: any;
}

export class AbilityContext<S = any> {
    game: Game;
    source: S;
    player: Player;
    ability: BaseAbility;
    costs: any;
    targets: any;
    rings: any;
    selects: any;
    tokens: any;
    elements: any;
    events: any[] = [];
    stage: Stages;
    targetAbility: any;
    target: any;
    select: string;
    ring: Ring;
    token: StatusToken;
    element: any;
    elementCard: BaseCard;
    provincesToRefill: any[] = [];
    subResolution = false;
    choosingPlayerOverride: Player = null;
    gameActionsResolutionChain: GameAction[] = [];
    playType: PlayTypes;
    cardStateWhenInitiated: any = null;

    constructor(properties: AbilityContextProperties) {
        this.game = properties.game;
        this.source = properties.source || new EffectSource(this.game);
        this.player = properties.player;
        this.ability = properties.ability || new BaseAbility({});
        this.costs = properties.costs || {};
        this.targets = properties.targets || {};
        this.rings = properties.rings || {};
        this.selects = properties.selects || {};
        this.tokens = properties.tokens || {};
        this.elements = properties.elements || {};
        this.stage = properties.stage || Stages.Effect;
        this.targetAbility = properties.targetAbility;
        // const location = this.player && this.player.playableLocations.find(location => location.contains(this.source));
        this.playType = this.player && this.player.findPlayType(this.source); //location && location.playingType;
    }

    copy(newProps: Partial<AbilityContextProperties>): AbilityContext<this> {
        let copy = this.createCopy(newProps);
        copy.target = this.target;
        copy.token = this.token;
        copy.element = this.element;
        copy.elementCard = this.elementCard;
        copy.select = this.select;
        copy.ring = this.ring;
        copy.provincesToRefill = this.provincesToRefill;
        copy.subResolution = this.subResolution;
        copy.choosingPlayerOverride = this.choosingPlayerOverride;
        copy.gameActionsResolutionChain = this.gameActionsResolutionChain;
        copy.playType = this.playType;
        return copy;
    }

    createCopy(newProps: Partial<AbilityContextProperties>): AbilityContext<this> {
        return new AbilityContext(Object.assign(this.getProps(), newProps));
    }

    refillProvince(player: Player, location: Locations): void {
        this.provincesToRefill.push({ player, location });
    }

    refill(): void {
        for (let player of this.game.getPlayersInFirstPlayerOrder()) {
            for (let refill of this.provincesToRefill.filter((refill) => refill.player === player)) {
                this.game.queueSimpleStep(() => {
                    player.replaceDynastyCard(refill.location);
                    return true;
                });
            }
        }
        this.game.queueSimpleStep(() => {
            this.game.checkGameState(true);
        });
    }

    getProps(): AbilityContextProperties {
        return {
            game: this.game,
            source: this.source,
            player: this.player,
            ability: this.ability,
            costs: Object.assign({}, this.costs),
            targets: Object.assign({}, this.targets),
            rings: Object.assign({}, this.rings),
            selects: Object.assign({}, this.selects),
            tokens: Object.assign({}, this.tokens),
            elements: Object.assign({}, this.elements),
            events: this.events,
            stage: this.stage,
            targetAbility: this.targetAbility
        };
    }
}