import { OngoingEffectBuilder } from '../core/ongoingEffect/OngoingEffectBuilder';
import { EffectName } from '../core/Constants';
import type { RestrictionProperties } from '../core/ongoingEffect/effectImpl/Restriction';
import { Restriction } from '../core/ongoingEffect/effectImpl/Restriction';

type PlayerCannotProperties = Omit<RestrictionProperties, 'params' | 'cannot'>;

export function playerCannot(properties: PlayerCannotProperties) {
    return OngoingEffectBuilder.player.static(EffectName.AbilityRestrictions, new Restriction(properties));
}
