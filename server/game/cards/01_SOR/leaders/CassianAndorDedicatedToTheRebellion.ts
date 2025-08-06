import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class CassionAndorDedicatedToTheRebellion extends LeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3187874229',
            internalName: 'cassian-andor#dedicated-to-the-rebellion',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'If you\'ve dealt 3 or more damage to an enemy base this phase, draw a card.',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(1), AbilityHelper.costs.exhaustSelf()],
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => {
                    const damageDealtToBase = this.damageDealtThisPhaseWatcher.getDamageDealtByPlayer(
                        context.player,
                        (damage) =>
                            damage.target.isBase() &&
                            damage.target.controller !== context.player
                    ).reduce((sum, damage) => sum + damage.amount, 0);

                    return damageDealtToBase >= 3;
                },
                onTrue: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player })),
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Draw a card',
            collectiveTrigger: true,
            optional: true,
            when: {
                onDamageDealt: (event, context) =>
                    event.card.isBase() &&
                    event.card.controller !== context.player &&
                    event.damageSource.player === context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player })),
            limit: AbilityHelper.limit.perRound(1)
        });
    }
}

