import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';
import { AbilityType } from '../../../core/Constants';

export default class RashAction extends EventCard {
    private damageDealtWatcher: DamageDealtThisPhaseWatcher;

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.damageDealtWatcher = abilityHelper.stateWatchers.damageDealtThisPhase();
    }

    protected override getImplementationId() {
        return {
            id: 'rash-action-id',
            internalName: 'rash-action',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. For this attack, it gets +1/+0 and gains: "When Attack Ends: If this unit dealt combat damage to an opponent\'s base, that opponent discards a card."',
            targetResolver: {
                immediateEffect: abilityHelper.immediateEffects.attack({
                    attackerLastingEffects: [
                        { effect: abilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }) },
                        {
                            effect: abilityHelper.ongoingEffects.gainAbility({
                                title: 'Your opponent discards a card',
                                type: AbilityType.Triggered,
                                when: {
                                    onAttackEnd: (event, context) => event.attack.attacker === context.source
                                },
                                immediateEffect:
                                    abilityHelper.immediateEffects.conditional({
                                        condition: (context) => this.damageDealtWatcher.unitHasDealtCombatDamageToBaseThisAttack(context.source, context),
                                        onTrue: abilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                                            target: context.source.controller.opponent,
                                            amount: 1
                                        }))
                                    })
                            })
                        }
                    ]
                })
            }
        });
    }
}
