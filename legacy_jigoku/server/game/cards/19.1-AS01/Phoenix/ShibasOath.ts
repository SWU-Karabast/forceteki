import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { AbilityTypes, CardTypes, Locations } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { TriggeredAbilityProps } from '../../../Interfaces';

export default class ShibasOath extends DrawCard {
    static id = 'shiba-s-oath';

    public setupCardAbilities() {
        this.attachmentConditions({
            limitTrait: { title: 1 },
            cardCondition: (card) => card.hasTrait('bushi')
        });

        this.reaction({
            title: 'Honor attached character',
            when: {
                onCardAttached: (event, context) =>
                    event.card === context.source && event.originalLocation !== Locations.PlayArea
            },
            gameAction: AbilityDsl.actions.honor((context) => ({
                target: context.source.parent
            })),
            effect: 'honor {1}',
            effectArgs: (context) => context.source.parent
        });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.WouldInterrupt, {
                title: 'Cancel an ability',
                when: {
                    onInitiateAbilityEffects: (event, context) =>
                        (event.cardTargets as Array<BaseCard>).some(
                            (card) =>
                                // In play
                                card.location === Locations.PlayArea &&
                                // Character
                                card.getType() === CardTypes.Character &&
                                // Friendly
                                card.controller === context.player &&
                                // Not a Bushi
                                !card.hasTrait('bushi')
                        )
                },
                cost: AbilityDsl.costs.sacrificeSelf(),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.cancel(),
                    AbilityDsl.actions.moveCard({
                        target: this,
                        destination: Locations.Hand
                    })
                ]),
                effect: 'cancel the effects of {1} and return {2} to their hand',
                effectArgs: (context) => [context.event.card, this]
            } as TriggeredAbilityProps)
        });
    }
}