import { EffectNames } from '../../Constants';
import { EffectBuilder } from '../EffectBuilder';

export type MustBeDeclaredAsAttackerValue = 'both' | 'military' | 'political';

export function mustBeDeclaredAsAttacker(type: MustBeDeclaredAsAttackerValue = 'both') {
    return EffectBuilder.card.static(EffectNames.MustBeDeclaredAsAttacker, type);
}