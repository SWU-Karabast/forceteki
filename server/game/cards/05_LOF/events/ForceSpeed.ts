import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityType, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class ForceSpeed extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6551214763',
            internalName: 'force-speed',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. For this attack, it gains: "On Attack: Return any number of non-unique upgrades attached to the defender to their owners\' hands."',
            initiateAttack: {
                attackerLastingEffects: (_context, attack) => ({
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'Return any number of non-unique upgrades attached to the defender to their owners\' hands.',
                        type: AbilityType.Triggered,
                        when: { onAttack: true },
                        immediateEffect: AbilityHelper.immediateEffects.selectCard({
                            cardTypeFilter: WildcardCardType.Upgrade,
                            mode: TargetMode.Unlimited,
                            cardCondition: (card) =>
                                card.isUpgrade() &&
                                !card.unique &&
                                attack.getAllTargets().some((target) => target === card.parentCard),
                            immediateEffect: AbilityHelper.immediateEffects.returnToHand()
                        })
                    })
                })
            }
        });
    }
}