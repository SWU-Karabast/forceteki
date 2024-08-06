import type { AbilityContext } from '../../AbilityContext';
import type BaseCard from '../../basecard';
import { EffectNames } from '../../Constants';
import { EffectBuilder } from '../EffectBuilder';

export type AttachmentPoliticalSkillModifierValue = number | ((card: BaseCard, context: AbilityContext) => number);

export function attachmentPoliticalSkillModifier(value: AttachmentPoliticalSkillModifierValue) {
    return EffectBuilder.card.flexible(EffectNames.AttachmentPoliticalSkillModifier, value);
}