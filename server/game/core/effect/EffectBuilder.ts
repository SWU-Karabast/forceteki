import type { AbilityContext } from '../ability/AbilityContext';
import type PlayerOrCardAbility from '../ability/PlayerOrCardAbility';
import type Card from '../card/Card';
import type { Duration, EffectName, Location } from '../Constants';
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

interface Props {
    targetLocation?: Location | Location[];
    canChangeZoneOnce?: boolean;
    canChangeZoneNTimes?: number;
    duration?: Duration;
    condition?: (context: AbilityContext) => boolean;
    until?: WhenType;
    ability?: PlayerOrCardAbility;
    target?: PlayerOrCard | PlayerOrCard[];
    cannotBeCancelled?: boolean;
    optional?: boolean;
    parentAction?: GameSystem;
}

export const EffectBuilder = {
    card: {
        static: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new CardEffect(game, source, props, new StaticEffectDetails(type, value)),
        dynamic: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new CardEffect(game, source, props, new DynamicEffectDetails(type, value)),
        detached: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new CardEffect(game, source, props, new DetachedEffectDetails(type, value.apply, value.unapply)),
        flexible: (type: EffectName, value?: unknown) =>
            (typeof value === 'function'
                ? EffectBuilder.card.dynamic(type, value)
                : EffectBuilder.card.static(type, value))
    },
    player: {
        static: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new PlayerEffectDetails(game, source, props, new StaticEffectDetails(type, value)),
        dynamic: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new PlayerEffectDetails(game, source, props, new DynamicEffectDetails(type, value)),
        detached: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new PlayerEffectDetails(game, source, props, new DetachedEffectDetails(type, value.apply, value.unapply)),
        flexible: (type: EffectName, value) =>
            (typeof value === 'function'
                ? EffectBuilder.player.dynamic(type, value)
                : EffectBuilder.player.static(type, value))
    },
    // // TODO: change this to combat
    // conflict: {
    //     static: (type: EffectName, value) => (game: Game, source: BaseCard, props: Props) =>
    //         new ConflictEffect(game, source, props, new StaticEffect(type, value)),
    //     dynamic: (type: EffectName, value) => (game: Game, source: BaseCard, props: Props) =>
    //         new ConflictEffect(game, source, props, new DynamicEffect(type, value)),
    //     detached: (type: EffectName, value) => (game: Game, source: BaseCard, props: Props) =>
    //         new ConflictEffect(game, source, props, new DetachedEffect(type, value.apply, value.unapply)),
    //     flexible: (type: EffectName, value) =>
    //         typeof value === 'function'
    //             ? EffectBuilder.conflict.dynamic(type, value)
    //             : EffectBuilder.conflict.static(type, value)
    // }
};
