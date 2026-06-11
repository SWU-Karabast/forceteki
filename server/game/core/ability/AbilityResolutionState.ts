import type { Card } from '../card/Card';

/**
 * State that flows between sequential steps of an ability resolution, shared across
 * contexts that conceptually represent the same outer resolution. Most importantly, a
 * {@link ReplacementEffectContext} inherits the resolution state of the context whose
 * event it is replacing — so when a replaced step (e.g. a deck search) produces a
 * prompt result, the outer ability's later steps can read it.
 */
export class AbilityResolutionState {
    public selectedPromptCards: Card[] = [];
}
