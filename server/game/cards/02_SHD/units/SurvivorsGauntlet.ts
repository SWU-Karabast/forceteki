import AbilityHelper from '../../../AbilityHelper';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer, WildcardZoneName } from '../../../core/Constants';

export default class SurvivorsGauntlet extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1503633301',
            internalName: 'survivors-gauntlet',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Attach an upgrade on a unit to another eligible unit controlled by the same player',
            optional: true,
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolvers: {
                chooseUpgrade: {
                    cardTypeFilter: WildcardCardType.Upgrade,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: WildcardRelativePlayer.Any,
                },
                chooseUnit: {
                    dependsOn: 'chooseUpgrade',
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: (context) => EnumHelpers.asRelativePlayer(context.player, context.targets.chooseUpgrade.parentCard.controller),
                    cardCondition: (card, context) =>
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
