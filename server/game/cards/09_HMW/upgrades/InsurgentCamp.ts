import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { CardType } from '../../../core/Constants';

export default class InsurgentCamp extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '4289478789',
            internalName: 'insurgent-camp',
        };
    }

    public override setupCardAbilities (registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat this upgrade to ready that unit',
            contextTitle: (context) => `Defeat this upgrade to ready ${context.event.card.title}`,
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                // NOTE: This may need to be adjusted in the event the card receives an errata to be in line with Neel
                condition: (context) => context.event.card.getPower() <= 3,
                onTrue: abilityHelper.immediateEffects.defeat((context) => ({ target: context.source }))
            }),
            ifYouDo: {
                title: 'Ready that unit',
                immediateEffect: abilityHelper.immediateEffects.ready((context) => ({
                    target: context.event.card,
                }))
            }
        });
    }
}