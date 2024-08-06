import { EffectNames } from '../../Constants';
import { EffectBuilder } from '../EffectBuilder';

export function switchAttachmentSkillModifiers() {
    return EffectBuilder.card.flexible(EffectNames.SwitchAttachmentSkillModifiers);
}
