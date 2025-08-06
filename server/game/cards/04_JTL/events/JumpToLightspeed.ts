import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { CardType, RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import * as Helper from '../../../core/utils/Helpers';

export default class JumpToLightspeed extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5329736697',
            internalName: 'jump-to-lightspeed',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Return a friendly space unit and any number of non-leader upgrades on it to their owner\'s hand.',
            targetResolvers: {
                friendlySpaceUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.SpaceArena,
                    controller: RelativePlayer.Self,
                },
                attachedUpgrades: {
                    mode: TargetMode.Unlimited,
                    canChooseNoCards: true,
                    dependsOn: 'friendlySpaceUnit',
                    cardTypeFilter: WildcardCardType.NonLeaderUpgrade,
                    cardCondition: (card, context) => card.isUpgrade() && card.parentCard === context.targets.friendlySpaceUnit,
                    immediateEffect: AbilityHelper.immediateEffects.returnToHand((context) => ({
                        target: context.targets.friendlySpaceUnit,
                        attachedUpgradeOverrideHandler: (card) => (
                            context.targets.attachedUpgrades?.includes(card)
                                ? AbilityHelper.immediateEffects.returnToHand({ target: card })
                                : null
                        ),
                    }))
                }
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'The next time you play a copy of that unit this phase, you may play it for free',
                immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                    effect: AbilityHelper.ongoingEffects.forFree({
                        cardTypeFilter: CardType.BasicUnit,
                        match: (card) => {
                            const selectedCard = Helper.asArray(ifYouDoContext.targets.friendlySpaceUnit)[0];
                            return selectedCard.title === card.title && selectedCard.subtitle === card.subtitle;
                        },
                        limit: AbilityHelper.limit.perPlayerPerGame(1)
                    })
                })
            })
        });
    }
}
