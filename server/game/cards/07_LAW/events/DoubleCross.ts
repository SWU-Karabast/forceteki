import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class DoubleCross extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'doublecross-id',
            internalName: 'doublecross',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a friendly non-leader unit and an enemy non-leader unit. Exchange control of those units. The player who takes control of the lower-cost unit creates Credit tokens equal to the difference between those units\' costs.',
            targetResolvers: {
                friendlyUnit: {
                    activePromptTitle: 'Choose a friendly non-leader unit',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                },
                enemyUnit: {
                    dependsOn: 'friendlyUnit',
                    activePromptTitle: 'Choose an enemy non-leader unit',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: abilityHelper.immediateEffects.sequential([
                        abilityHelper.immediateEffects.simultaneous((context) => ([
                            abilityHelper.immediateEffects.takeControlOfUnit({
                                target: context.targets.friendlyUnit,
                                newController: context.targets.friendlyUnit.controller.opponent,
                            }),
                            abilityHelper.immediateEffects.takeControlOfUnit({
                                target: context.targets.enemyUnit,
                                newController: context.targets.enemyUnit.controller.opponent,
                            }),
                        ])),
                        abilityHelper.immediateEffects.createCreditToken((context) => {
                            // Calculate cost difference
                            const friendlyCost = context.targets.friendlyUnit.cost;
                            const enemyCost = context.targets.enemyUnit.cost;
                            const costDifference = Math.abs(friendlyCost - enemyCost);

                            // Determine who gets the credit tokens
                            const creditRecipient = friendlyCost < enemyCost ? context.player.opponent : context.player;

                            return {
                                amount: costDifference,
                                target: creditRecipient
                            };
                        })
                    ])
                }
            }
        });
    }
}