import type { AbilityContext } from '../ability/AbilityContext.js';
import { BaseCardSelector } from './BaseCardSelector.js';

/**
 * A simple concrete implementation that doesn't impose any limits on the number of cards that can be selected
 */
export class UnlimitedCardSelector<TContext extends AbilityContext = AbilityContext> extends BaseCardSelector<TContext> {
}
