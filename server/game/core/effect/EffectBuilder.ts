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
import DetachedEffectImpl from './effectImpl/DetachedEffectImpl';
import DynamicEffectImpl from './effectImpl/DynamicEffectImpl';
import PlayerEffect from './PlayerEffect';
import StaticEffectImpl from './effectImpl/StaticEffectImpl';

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

/* Types of effect
    1. Static effects - do something for a period
    2. Dynamic effects - like static, but what they do depends on the game state
    3. Detached effects - do something when applied, and on expiration, but can be ignored in the interim
*/

export const EffectBuilder = {
    card: {
        static: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new CardEffect(game, source, props, new StaticEffectImpl(type, value)),
        dynamic: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new CardEffect(game, source, props, new DynamicEffectImpl(type, value)),
        detached: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new CardEffect(game, source, props, new DetachedEffectImpl(type, value.apply, value.unapply)),
        flexible: (type: EffectName, value?: unknown) =>
            (typeof value === 'function'
                ? EffectBuilder.card.dynamic(type, value)
                : EffectBuilder.card.static(type, value))
    },
    player: {
        static: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new PlayerEffect(game, source, props, new StaticEffectImpl(type, value)),
        dynamic: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new PlayerEffect(game, source, props, new DynamicEffectImpl(type, value)),
        detached: (type: EffectName, value) => (game: Game, source: Card, props: Props) =>
            new PlayerEffect(game, source, props, new DetachedEffectImpl(type, value.apply, value.unapply)),
        flexible: (type: EffectName, value) =>
            (typeof value === 'function'
                ? EffectBuilder.player.dynamic(type, value)
                : EffectBuilder.player.static(type, value))
    }
};
