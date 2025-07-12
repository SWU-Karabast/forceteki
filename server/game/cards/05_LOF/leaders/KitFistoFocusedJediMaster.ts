import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class KitFistoFocusedJediMaster extends LeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '3822427538',
            internalName: 'kit-fisto#focused-jedi-master',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'If you attacked with a Jedi unit this phase, deal 2 damage to a unit',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({
                        controller: context.player,
                        filter: (attack) => context.source !== attack.attacker && attack.attacker.hasSomeTrait(Trait.Jedi)
                    }),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 2 }),
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for each other friendly Jedi unit.',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => {
                const jediUnitCount = target.controller.getArenaUnits({
                    condition: (card) => card.hasSomeTrait(Trait.Jedi),
                    otherThan: target
                }).length;
                return ({
                    power: jediUnitCount,
                    hp: 0,
                });
            }),
        });
    }
}
