import type { AbilityContext } from '../AbilityContext';
import type BaseAbility from '../baseability';
import type BaseCard from '../card/basecard';
import type { Durations, EffectNames, Locations } from '../Constants';
import type Game from '../game';
import type { GameAction, GameActionProperties } from '../gameActions/GameAction';
import type { WhenType } from '../Interfaces';
import type Player from '../player';
// import type { StatusToken } from '../StatusToken';
import CardEffect from './CardEffect';
// import ConflictEffect from './ConflictEffect';
import DetachedEffect from './DetachedEffect';
import DynamicEffect from './DynamicEffect';
import PlayerEffect from './PlayerEffect';
import StaticEffect from './StaticEffect';

// type PlayerOrCardOrToken = Player | BaseCard | StatusToken;
type PlayerOrCardOrToken = Player | BaseCard;

type Props = {
    targetLocation?: Locations | Locations[];
    canChangeZoneOnce?: boolean;
    canChangeZoneNTimes?: number;
    duration?: Durations;
    condition?: (context: AbilityContext) => boolean;
    until?: WhenType;
    ability?: BaseAbility;
    target?: PlayerOrCardOrToken | PlayerOrCardOrToken[];
    cannotBeCancelled?: boolean;
    optional?: boolean;
    parentAction?: GameAction<GameActionProperties>;
};

export const EffectBuilder = {
    card: {
        static: (type: EffectNames, value) => (game: Game, source: BaseCard, props: Props) =>
            new CardEffect(game, source, props, new StaticEffect(type, value)),
        dynamic: (type: EffectNames, value) => (game: Game, source: BaseCard, props: Props) =>
            new CardEffect(game, source, props, new DynamicEffect(type, value)),
        detached: (type: EffectNames, value) => (game: Game, source: BaseCard, props: Props) =>
            new CardEffect(game, source, props, new DetachedEffect(type, value.apply, value.unapply)),
        flexible: (type: EffectNames, value?: unknown) =>
            typeof value === 'function'
                ? EffectBuilder.card.dynamic(type, value)
                : EffectBuilder.card.static(type, value)
    },
    player: {
        static: (type: EffectNames, value) => (game: Game, source: BaseCard, props: Props) =>
            new PlayerEffect(game, source, props, new StaticEffect(type, value)),
        dynamic: (type: EffectNames, value) => (game: Game, source: BaseCard, props: Props) =>
            new PlayerEffect(game, source, props, new DynamicEffect(type, value)),
        detached: (type: EffectNames, value) => (game: Game, source: BaseCard, props: Props) =>
            new PlayerEffect(game, source, props, new DetachedEffect(type, value.apply, value.unapply)),
        flexible: (type: EffectNames, value) =>
            typeof value === 'function'
                ? EffectBuilder.player.dynamic(type, value)
                : EffectBuilder.player.static(type, value)
    },
    // // TODO: change this to combat
    // conflict: {
    //     static: (type: EffectNames, value) => (game: Game, source: BaseCard, props: Props) =>
    //         new ConflictEffect(game, source, props, new StaticEffect(type, value)),
    //     dynamic: (type: EffectNames, value) => (game: Game, source: BaseCard, props: Props) =>
    //         new ConflictEffect(game, source, props, new DynamicEffect(type, value)),
    //     detached: (type: EffectNames, value) => (game: Game, source: BaseCard, props: Props) =>
    //         new ConflictEffect(game, source, props, new DetachedEffect(type, value.apply, value.unapply)),
    //     flexible: (type: EffectNames, value) =>
    //         typeof value === 'function'
    //             ? EffectBuilder.conflict.dynamic(type, value)
    //             : EffectBuilder.conflict.static(type, value)
    // }
};