import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class HeraSyndullaRenegadeGeneral extends NonLeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'hera-syndulla#renegade-general-id',
            internalName: 'hera-syndulla#renegade-general',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = abilityHelper.stateWatchers.damageDealtThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'Heal damage from your base equal to damage you deal on opponent base',
            contextTitle: (context) => `Heal ${this.damageDealtThisPhaseWatcher.getDamageDealtToBaseByUnitThisAttack(context.source, context)} damage from your base`,
            immediateEffect: abilityHelper.immediateEffects.conditional((context) => {
                const damageDealt = this.damageDealtThisPhaseWatcher.getDamageDealtToBaseByUnitThisAttack(context.source, context);
                return {
                    condition: () => damageDealt > 0,
                    onTrue: abilityHelper.immediateEffects.heal((context) => ({
                        target: context.player.base,
                        amount: damageDealt
                    }))
                };
            })
        });
    }
}