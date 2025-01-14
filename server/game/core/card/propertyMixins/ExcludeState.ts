import type { Card, CardConstructor, ICardState } from '../Card';

export function ExcludeState<TBaseClass extends CardConstructor<TState>, TState extends ICardState>(BaseClass: TBaseClass) {
    return BaseClass as TBaseClass & (new (...args: any[]) => (Card<TState> & { state: never }));
}