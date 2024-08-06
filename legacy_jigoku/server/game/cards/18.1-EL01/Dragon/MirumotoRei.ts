import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Durations, EffectNames, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { AttachmentMilitarySkillModifierValue } from '../../../Effects/Library/attachmentMilitarySkillModifier';
import type { AttachmentPoliticalSkillModifierValue } from '../../../Effects/Library/attachmentPoliticalSkillModifier';

function sumModifiers(
    modifiers: Array<AttachmentMilitarySkillModifierValue> | Array<AttachmentPoliticalSkillModifierValue>,
    target: DrawCard,
    context: AbilityContext
): number {
    return modifiers.reduce<number>((a, b) => a + (typeof b === 'number' ? b : b(target, context)), 0);
}

export default class MirumotoRei extends DrawCard {
    static id = 'mirumoto-rei';

    setupCardAbilities() {
        this.action({
            title: 'Give a skill bonus based on attachments',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card, context) =>
                    card.isParticipating() && card.hasTrait('bushi') && card !== context.source,
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    target: context.source,
                    effect: [
                        AbilityDsl.effects.modifyMilitarySkill(
                            sumModifiers(
                                context.target.getEffects(EffectNames.AttachmentMilitarySkillModifier),
                                context.target,
                                context
                            )
                        ),
                        AbilityDsl.effects.modifyPoliticalSkill(
                            sumModifiers(
                                context.target.getEffects(EffectNames.AttachmentPoliticalSkillModifier),
                                context.target,
                                context
                            )
                        )
                    ],
                    duration: Durations.UntilEndOfConflict
                }))
            },
            effect: 'give {1} a skill bonus equal to the total attachment skill bonus on {0} ({2}{3}/{4}{5})',
            effectArgs: (context) => [
                context.source,
                sumModifiers(
                    context.target.getEffects(EffectNames.AttachmentMilitarySkillModifier),
                    context.target,
                    context
                ),
                'military',
                sumModifiers(
                    context.target.getEffects(EffectNames.AttachmentPoliticalSkillModifier),
                    context.target,
                    context
                ),
                'political'
            ]
        });
    }
}