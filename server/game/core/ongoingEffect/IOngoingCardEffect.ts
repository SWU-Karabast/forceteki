import { AbilityContext } from '../ability/AbilityContext';
import { EffectName } from '../Constants';
import type { GameObject } from '../GameObject';

// TODO: this is being used to cheat around needing type information for 'value' from the OngoingEffect* classes.
// ideally we would have type information for the possible types of effect values, but every situation is using a different type
// so it will be a big effort to categorize them and set up machinery for separating them out
export interface IOngoingCardEffect {
    type: EffectName;
    value: any;
    getValue: <T = any>(obj: GameObject) => T;
    context: AbilityContext;
}