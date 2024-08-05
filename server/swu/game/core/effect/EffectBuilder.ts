import type { AbilityContext } from '../ability/AbilityContext';
import type PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import type Card from '../card/Card';
import type { Durations, EffectNames, Locations } from '../Constants';
import type Game from '../Game';
import type { GameSystem, IGameSystemProperties } from '../gameSystem/GameSystem';
import type { WhenType } from '../../Interfaces';
import type Player from '../Player';
// import type { StatusToken } from '../StatusToken';
import CardEffect from './CardEffect';
// import ConflictEffect from './ConflictEffect';
import DetachedEffectDetails from './effectDetails/DetachedEffectDetails';
import DynamicEffectDetails from './effectDetails/DynamicEffectDetails';
import PlayerEffectDetails from './PlayerEffect';
import StaticEffectDetails from './effectDetails/StaticEffectDetails';

type PlayerOrCard = Player | Card;

type Props = {
    targetLocation?: Locations | Locations[];
    canChangeZoneOnce?: boolean;
    canChangeZoneNTimes?: number;
    duration?: Durations;
    condition?: (context: AbilityContext) => boolean;
    until?: WhenType;
    ability?: PlayerOrCardAbility;
    target?: PlayerOrCard | PlayerOrCard[];
    cannotBeCancelled?: boolean;
    optional?: boolean;
    parentAction?: GameSystem<IGameSystemProperties>;
};

export const EffectBuilder = {
    card: {
        static: (type: EffectNames, value) => (game: Game, source: Card, props: Props) =>
            new CardEffect(game, source, props, new StaticEffectDetails(type, value)),
        dynamic: (type: EffectNames, value) => (game: Game, source: Card, props: Props) =>
            new CardEffect(game, source, props, new DynamicEffectDetails(type, value)),
        detached: (type: EffectNames, value) => (game: Game, source: Card, props: Props) =>
            new CardEffect(game, source, props, new DetachedEffectDetails(type, value.apply, value.unapply)),
        flexible: (type: EffectNames, value?: unknown) =>
            typeof value === 'function'
                ? EffectBuilder.card.dynamic(type, value)
                : EffectBuilder.card.static(type, value)
    },
    player: {
        static: (type: EffectNames, value) => (game: Game, source: Card, props: Props) =>
            new PlayerEffectDetails(game, source, props, new StaticEffectDetails(type, value)),
        dynamic: (type: EffectNames, value) => (game: Game, source: Card, props: Props) =>
            new PlayerEffectDetails(game, source, props, new DynamicEffectDetails(type, value)),
        detached: (type: EffectNames, value) => (game: Game, source: Card, props: Props) =>
            new PlayerEffectDetails(game, source, props, new DetachedEffectDetails(type, value.apply, value.unapply)),
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