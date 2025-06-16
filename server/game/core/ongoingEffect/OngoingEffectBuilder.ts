import type { Card } from '../card/Card';
import type { EffectName } from '../Constants';
import type Game from '../Game';
import type { IOngoingCardEffectProps, IOngoingPlayerEffectProps, IOngoingCardEffectGenerator, IOngoingPlayerEffectGenerator } from '../../Interfaces';
// import type { StatusToken } from '../StatusToken';
import { OngoingCardEffect } from './OngoingCardEffect';
// import ConflictEffect from './ConflictEffect';
import type { CalculateOngoingEffect } from './effectImpl/DynamicOngoingEffectImpl';
import DynamicOngoingEffectImpl from './effectImpl/DynamicOngoingEffectImpl';
import { OngoingPlayerEffect } from './OngoingPlayerEffect';
import StaticOngoingEffectImpl from './effectImpl/StaticOngoingEffectImpl';
import type { OngoingEffectValueWrapper } from './effectImpl/OngoingEffectValueWrapper';
import { is } from '../utils/TypeHelpers';
import DetachedOngoingEffectValueWrapper from './effectImpl/DetachedOngoingEffectValueWrapper';

/* Types of effect
    1. Static effects - do something for a period
    2. Dynamic effects - like static, but what they do depends on the game state
    3. Detached effects - do something when applied, and on expiration, but can be ignored in the interim
*/

export const OngoingEffectBuilder = {
    card: {
        static: <TValue>(type: EffectName, value?: ((game: Game) => OngoingEffectValueWrapper<TValue>) | OngoingEffectValueWrapper<TValue> | TValue): IOngoingCardEffectGenerator => (game: Game, source: Card, props: IOngoingCardEffectProps) =>
            new OngoingCardEffect(game, source, props, new StaticOngoingEffectImpl(game, type, is.function(value) ? value(game) : value)),
        dynamic: <TValue>(type: EffectName, value: CalculateOngoingEffect<TValue>): IOngoingCardEffectGenerator => (game: Game, source: Card, props: IOngoingCardEffectProps) =>
            new OngoingCardEffect(game, source, props, new DynamicOngoingEffectImpl(game, type, value)),
        detached: (type: EffectName, value): IOngoingCardEffectGenerator => (game: Game, source: Card, props: IOngoingCardEffectProps) =>
            new OngoingCardEffect(game, source, props, new StaticOngoingEffectImpl(game, type, new DetachedOngoingEffectValueWrapper(game, value.apply, value.unapply))),
        flexible: <TValue>(type: EffectName, value?: CalculateOngoingEffect<TValue> | OngoingEffectValueWrapper<TValue> | TValue): IOngoingCardEffectGenerator =>
            (is.function(value)
                ? OngoingEffectBuilder.card.dynamic(type, value)
                : OngoingEffectBuilder.card.static(type, value))
    },
    player: {
        static: <TValue>(type: EffectName, value?: ((game: Game) => OngoingEffectValueWrapper<TValue>) | OngoingEffectValueWrapper<TValue> | TValue): IOngoingPlayerEffectGenerator => (game: Game, source: Card, props: IOngoingPlayerEffectProps) =>
            new OngoingPlayerEffect(game, source, props, new StaticOngoingEffectImpl(game, type, is.function(value) ? value(game) : value)),
        dynamic: <TValue>(type: EffectName, value: CalculateOngoingEffect<TValue>): IOngoingPlayerEffectGenerator => (game: Game, source: Card, props: IOngoingPlayerEffectProps) =>
            new OngoingPlayerEffect(game, source, props, new DynamicOngoingEffectImpl(game, type, value)),
        detached: (type: EffectName, value): IOngoingPlayerEffectGenerator => (game: Game, source: Card, props: IOngoingPlayerEffectProps) =>
            new OngoingPlayerEffect(game, source, props, new StaticOngoingEffectImpl(game, type, new DetachedOngoingEffectValueWrapper(game, value.apply, value.unapply))),
        flexible: <TValue>(type: EffectName, value?: CalculateOngoingEffect<TValue> | OngoingEffectValueWrapper<TValue> | TValue): IOngoingPlayerEffectGenerator =>
            (is.function(value)
                ? OngoingEffectBuilder.player.dynamic(type, value)
                : OngoingEffectBuilder.player.static(type, value))
    }
};
