import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class MaulMasterOfTheShadowCollective extends NonLeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7615680141',
            internalName: 'maul#master-of-the-shadow-collective',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'If Maul dealt combat damage to a base, take control of an enemy non-leader unit until Maul leaves the arena',
            attackerMustSurvive: true,  // this is an optimization we can do for now since there isn't any effect that cares about momentarily taking control
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    this.damageDealtThisPhaseWatcher.unitHasDealtCombatDamageToBaseThisAttack(context.source, context),
                onTrue: AbilityHelper.immediateEffects.selectCard((selectCardContext) => ({
                    activePromptTitle: 'Select a unit to take control of until Maul leaves the arena',
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    controller: RelativePlayer.Opponent,
                    optional: true,
                    immediateEffect: AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                            newController: context.player,
                            target: context.target
                        })),
                        AbilityHelper.immediateEffects.whenSourceLeavesPlayDelayedCardEffect((context) => ({
                            title: 'Return the stolen unit to its owner',
                            target: context.target,
                            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit({
                                newController: selectCardContext.target.owner,
                                excludeLeaderUnit: false,
                                target: selectCardContext.target,
                            }),
                        }))
                    ])
                }))
            })
        });
    }
}
