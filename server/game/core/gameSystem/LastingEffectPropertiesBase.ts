import type { IOngoingEffectGenerator, WhenType } from '../../Interfaces';
import type { AbilityContext } from '../ability/AbilityContext';
import type { PlayerOrCardAbility } from '../ability/PlayerOrCardAbility';
import type { Duration } from '../Constants';
import { type IGameSystemProperties } from './GameSystem';

interface ILastingEffectPropertiesAnyDuration extends IGameSystemProperties {
    duration: Duration;
    ability?: PlayerOrCardAbility;
    condition?: (context: AbilityContext) => boolean;
    effect?: IOngoingEffectGenerator | IOngoingEffectGenerator[];
    ongoingEffectDescription?: string;
    ongoingEffectTargetDescription?: string;

    /**
     * Optional standalone description of this lasting effect for the game state summary. Set this when
     * the creating ability's own title isn't specific enough — e.g. the effect is built inside a
     * `Select`/`choices` handler or modal option, so the ability title is just a generic header. Mirrors
     * the required `title` on delayed effects, but is optional (the summary falls back to the ability title).
     */
    title?: string;
}

interface ILastingEffectPropertiesSetDuration extends ILastingEffectPropertiesAnyDuration {
    duration:
      Duration.Persistent |
      Duration.UntilEndOfAttack |
      Duration.UntilEndOfPhase |
      Duration.UntilEndOfRound |
      Duration.WhileSourceInPlay;
}

interface ILastingEffectPropertiesCustomDuration extends ILastingEffectPropertiesAnyDuration {
    duration: Duration.Custom;
    until: WhenType;
}

export type ILastingEffectPropertiesBase = ILastingEffectPropertiesSetDuration | ILastingEffectPropertiesCustomDuration;
