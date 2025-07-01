import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class InfusedBrawler extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5390030381',
            internalName: 'infused-brawler',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Use the Force to give 2 Experience tokens to this unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Give 2 Experience tokens to this unit',
                immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                    amount: 2,
                    target: context.source
                }))
            }
        });

        card.addTriggeredAbility({
            title: 'Defeat an Experience token on Infused Brawler',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.source.upgrades.some((x) => x.isExperience()),
                onTrue: AbilityHelper.immediateEffects.defeat((context) => ({
                    target: context.source.upgrades.find((upgrade) => upgrade.isExperience()),
                }))
            })
        });
    }
}