import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class BoKatanKryzePrincessInExile extends LeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '7424360283',
            internalName: 'bokatan-kryze#princess-in-exile',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addActionAbility({
            title: 'If you attacked with a Mandalorian unit this phase, deal 1 damage to a unit',
            cost: [AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({
                        controller: context.player,
                        filter: (attack) => context.source !== attack.attacker && attack.attacker.hasSomeTrait(Trait.Mandalorian)
                    }),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addOnAttackAbility({
            title: 'You may deal 1 damage to a unit. If you attacked with another Mandalorian unit this phase, you may deal 1 damage to a unit',
            // TODO: correct implementation of the rules for multiple instances of damage in the same ability
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: true,
                    immediateEffect: AbilityHelper.immediateEffects.damage({
                        amount: 1
                    }),
                }),
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: true,
                    immediateEffect: AbilityHelper.immediateEffects.conditional({
                        condition: (context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({
                            controller: context.player,
                            filter: (attack) => context.source !== attack.attacker && attack.attacker.hasSomeTrait(Trait.Mandalorian)
                        }),
                        onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                    })
                })
            ])
        });
    }
}
