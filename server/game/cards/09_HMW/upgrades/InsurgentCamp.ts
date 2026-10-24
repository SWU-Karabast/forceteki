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
            optional: true,
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    (event.card.isInPlay() && event.card.getPower() <= 3) &&
                    event.player === context.player
            },
            immediateEffect: abilityHelper.immediateEffects.defeat((context) => ({ target: context.source })),
            ifYouDo: (ifYouDoContext) => ({
                title: `Ready ${ifYouDoContext.event.card.title}`,
                immediateEffect: abilityHelper.immediateEffects.ready({
                    target: ifYouDoContext.event.card,
                })
            })
        });
    }
}