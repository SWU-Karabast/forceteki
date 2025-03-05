import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class ShuttleST149UnderKrennicsAuthority extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1519837763',
            internalName: 'shuttle-st149#under-krennics-authority',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Take control of a token upgrade on a unit and attach it to a different eligible unit.',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onCardDefeated: (event, context) => event.card === context.source,
            },
            targetResolvers: {
                chooseUpgrade: {
                    cardTypeFilter: WildcardCardType.Upgrade,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: WildcardRelativePlayer.Any,
                    cardCondition: (card) => card.isToken(),
                },
                chooseUnit: {
                    dependsOn: 'chooseUpgrade',
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: WildcardRelativePlayer.Any,
                    cardCondition: (card, context) =>
                        context.targets.chooseUpgrade.parentCard !== card &&
                        context.targets.chooseUpgrade.canAttach(card, context, context.targets.chooseUpgrade.parentCard.controller),
                    immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                        upgrade: context.targets.chooseUpgrade,
                        target: context.targets.chooseUnit,
                        newController: RelativePlayer.Self,
                    })),
                }
            }
        });
    }
}
