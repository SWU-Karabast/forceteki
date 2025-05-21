import type { AbilityContext } from '../ability/AbilityContext.js';
import type { TargetMode } from '../Constants.js';
import type { IBaseCardSelectorProperties } from './BaseCardSelector.js';
import { BaseCardSelector } from './BaseCardSelector.js';

export interface IUnlimitedCardSelectorProperties<TContext> extends IBaseCardSelectorProperties<TContext> {
    mode: TargetMode.Unlimited;
}

/**
 * A simple concrete implementation that doesn't impose any limits on the number of cards that can be selected
 */
export class UnlimitedCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
    public constructor(properties: IUnlimitedCardSelectorProperties<TContext>) {
        super(properties);
    }
}
