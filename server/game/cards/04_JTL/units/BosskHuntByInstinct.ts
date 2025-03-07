import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class BosskHuntByInstinct extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4573745395',
            internalName: 'bossk#hunt-by-instinct',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Exhaust the defender and deal 1 damage to it (if it\'s a unit)',
            immediateEffect: this.buildAbility()
        });

        this.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Exhaust the defender and deal 1 damage to it (if it\'s a unit)',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            immediateEffect: this.buildAbility()
        });
    }

    private buildAbility(): GameSystem<TriggeredAbilityContext<this>> {
        return AbilityHelper.immediateEffects.conditional({
            condition: (context) => context.event.attack.target.isUnit(),
            onTrue: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.exhaust((context) => ({ target: context.event.attack.target })),
                AbilityHelper.immediateEffects.damage((context) => ({ amount: 1, target: context.event.attack.target }))
            ]),
            onFalse: AbilityHelper.immediateEffects.noAction(),
        });
    }
}