import type { Card } from '../card/Card';
import type { EffectName } from '../Constants';
import type Game from '../Game';
import type { IOngoingEffectGenerator, IOngoingCardEffectProps, IOngoingPlayerEffectProps } from '../../Interfaces';
// import type { StatusToken } from '../StatusToken';
import { OngoingCardEffect } from './OngoingCardEffect';
// import ConflictEffect from './ConflictEffect';
import DetachedOngoingEffectImpl from './effectImpl/DetachedOngoingEffectImpl';
import type { CalculateOngoingEffect } from './effectImpl/DynamicOngoingEffectImpl';
import DynamicOngoingEffectImpl from './effectImpl/DynamicOngoingEffectImpl';
import { OngoingPlayerEffect } from './OngoingPlayerEffect';
import StaticOngoingEffectImpl from './effectImpl/StaticOngoingEffectImpl';
import type { OngoingEffectValueWrapper } from './effectImpl/OngoingEffectValueWrapper';

/* Types of effect
    1. Static effects - do something for a period
    2. Dynamic effects - like static, but what they do depends on the game state
    3. Detached effects - do something when applied, and on expiration, but can be ignored in the interim
*/

export const OngoingEffectBuilder = {
    card: {
        static: <TValue>(type: EffectName, value?: OngoingEffectValueWrapper<TValue> | TValue): IOngoingEffectGenerator => (game: Game, source: Card, props: IOngoingCardEffectProps) =>
            new OngoingCardEffect(game, source, props, new StaticOngoingEffectImpl(type, value)),
        dynamic: <TValue>(type: EffectName, value: CalculateOngoingEffect<TValue>): IOngoingEffectGenerator => (game: Game, source: Card, props: IOngoingCardEffectProps) =>
            new OngoingCardEffect(game, source, props, new DynamicOngoingEffectImpl(type, value)),
        detached: (type: EffectName, value): IOngoingEffectGenerator => (game: Game, source: Card, props: IOngoingCardEffectProps) =>
            new OngoingCardEffect(game, source, props, new DetachedOngoingEffectImpl(type, value.apply, value.unapply)),
        flexible: <TValue>(type: EffectName, value?: CalculateOngoingEffect<TValue> | OngoingEffectValueWrapper<TValue> | TValue): IOngoingEffectGenerator =>
            (typeof value === 'function'
                ? OngoingEffectBuilder.card.dynamic(type, value as CalculateOngoingEffect<TValue>)
                : OngoingEffectBuilder.card.static(type, value))
    },
    player: {
        static: <TValue>(type: EffectName, value?: OngoingEffectValueWrapper<TValue> | TValue): IOngoingEffectGenerator => (game: Game, source: Card, props: IOngoingPlayerEffectProps) =>
            new OngoingPlayerEffect(game, source, props, new StaticOngoingEffectImpl(type, value)),
        dynamic: <TValue>(type: EffectName, value: CalculateOngoingEffect<TValue>): IOngoingEffectGenerator => (game: Game, source: Card, props: IOngoingPlayerEffectProps) =>
            new OngoingPlayerEffect(game, source, props, new DynamicOngoingEffectImpl(type, value)),
        detached: (type: EffectName, value): IOngoingEffectGenerator => (game: Game, source: Card, props: IOngoingPlayerEffectProps) =>
            new OngoingPlayerEffect(game, source, props, new DetachedOngoingEffectImpl(type, value.apply, value.unapply)),
        flexible: <TValue>(type: EffectName, value?: CalculateOngoingEffect<TValue> | OngoingEffectValueWrapper<TValue> | TValue): IOngoingEffectGenerator =>
            (typeof value === 'function'
                ? OngoingEffectBuilder.player.dynamic(type, value as CalculateOngoingEffect<TValue>)
                : OngoingEffectBuilder.player.static(type, value))
    }
};
