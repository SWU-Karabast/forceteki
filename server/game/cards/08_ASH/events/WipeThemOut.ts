import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import { Contract } from '../../../core/utils/Contract';
import { AbilityType, DamageType, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';

export default class WipeThemOut extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8864145722',
            internalName: 'wipe-them-out',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. For this attack, you may deal its excess damage to another unit in the same arena.',
            initiateAttack: {
                optional: true,
                attackerLastingEffects: [{
                    effect: AbilityHelper.ongoingEffects.gainAbility({
                        title: 'Deal excess damage to another unit in the same arena',
                        type: AbilityType.Triggered,
                        optional: true,
                        when: {
                            onCardDefeated: (event, context) =>
                                event.isDefeatedByAttacker && DefeatCardSystem.defeatSourceCard(event) === context.source
                        },
                        targetResolver: {
                            cardTypeFilter: WildcardCardType.Unit,
                            controller: RelativePlayer.Opponent,
                            zoneFilter: WildcardZoneName.AnyArena,
                            cardCondition: (card, context?: TriggeredAbilityContext) => {
                                if (!context?.source || !context.event?.lastKnownInformation) {
                                    return false;
                                }

                                const arena = context.event.lastKnownInformation.arena;
                                return card.zoneName === arena && card !== context.source;
                            },
                            immediateEffect: AbilityHelper.immediateEffects.excessDamage((context) => {
                                Contract.assertTrue(context.isTriggered());
                                return {
                                    type: DamageType.Excess,
                                    sourceEventForExcessDamage: context.event.defeatSource.event
                                };
                            })
                        }
                    })
                }]
            }
        });
    }
}