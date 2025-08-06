import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class BosskHuntByInstinct extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4573745395',
            internalName: 'bossk#hunt-by-instinct',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Exhaust the defender and deal 1 damage to it (if it\'s a unit)',
            immediateEffect: this.buildAbility(AbilityHelper)
        });

        registrar.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Exhaust the defender and deal 1 damage to it (if it\'s a unit)',
            when: {
                onAttack: true,
            },
            immediateEffect: this.buildAbility(AbilityHelper)
        });
    }

    private buildAbility(AbilityHelper: IAbilityHelper): GameSystem<TriggeredAbilityContext<this>> {
        return AbilityHelper.immediateEffects.conditional({
            condition: (context) => context.event.attack.targetIsUnit(),
            onTrue: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.exhaust((context) => ({ target: context.event.attack.getSingleTarget() })),
                AbilityHelper.immediateEffects.damage((context) => ({ amount: 1, target: context.event.attack.getSingleTarget() }))
            ]),
        });
    }
}