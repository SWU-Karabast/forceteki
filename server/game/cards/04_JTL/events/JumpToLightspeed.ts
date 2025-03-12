import AbilityHelper from '../../../AbilityHelper';
import * as Helpers from '../../../core/utils/Helpers.js';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class JumpToLightspeed extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5329736697',
            internalName: 'jump-to-lightspeed',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Return a friendly space unit and any number of non-leader upgrades on it to their owner\'s hand.',
            targetResolvers: {
                friendlySpaceUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.SpaceArena,
                    controller: RelativePlayer.Self,
                },
                attachedUpgrades: {
                    mode: TargetMode.Unlimited,
                    dependsOn: 'friendlySpaceUnit',
                    cardTypeFilter: WildcardCardType.NonLeaderUpgrade,
                    cardCondition: (card, context) => card.isUpgrade() && card.parentCard === context.targets.friendlySpaceUnit
                }
            },
            then: {
                title: 'Return each selected card to hand',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous((context) => [
                    AbilityHelper.immediateEffects.returnToHand({
                        target: context.targets.friendlySpaceUnit
                    }),
                    AbilityHelper.immediateEffects.simultaneous(
                        Helpers.asArray(context.targets.attachedUpgrades).map((target) =>
                            AbilityHelper.immediateEffects.returnToHand({
                                target: target
                            })
                        )
                    )
                ])
            }
        });
    }
}
