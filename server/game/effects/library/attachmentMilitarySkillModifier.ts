import type { AbilityContext } from '../../AbilityContext';
import type BaseCard from '../../basecard';
import { EffectNames } from '../../Constants';
import { EffectBuilder } from '../EffectBuilder';

export type AttachmentMilitarySkillModifierValue = number | ((card: BaseCard, context: AbilityContext) => number);

export function attachmentMilitarySkillModifier(value: AttachmentMilitarySkillModifierValue) {
    return EffectBuilder.card.flexible(EffectNames.AttachmentMilitarySkillModifier, value);
}