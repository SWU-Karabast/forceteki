import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class UWingLander extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8544209291',
            internalName: 'uwing-lander',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give 3 Experience tokens to this unit',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({
                amount: 3,
                target: context.source
            })),
        });

        this.addTriggeredAbility({
            title: 'Attach an upgrade on this unit to another eligible friendly Vehicle unit',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker === context.source,
            },
            optional: true,
            targetResolvers: {
                chooseUpgrade: {
                    cardTypeFilter: WildcardCardType.Upgrade,
                    cardCondition: (card, context) => card.isUpgrade() && card.parentCard === context.source
                },
                chooseUnit: {
                    dependsOn: 'chooseUpgrade',
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    cardCondition: (card, context) =>
                        card.hasSomeTrait(Trait.Vehicle) &&
                        context.targets.chooseUpgrade.isUpgrade() &&
                        context.targets.chooseUpgrade.parentCard !== card &&
                        context.targets.chooseUpgrade.canAttach(card, context, context.targets.chooseUpgrade.parentCard.controller),
                    immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                        upgrade: context.targets.chooseUpgrade,
                        target: context.targets.chooseUnit,
                    })),
                }
            }
        });
    }
}
