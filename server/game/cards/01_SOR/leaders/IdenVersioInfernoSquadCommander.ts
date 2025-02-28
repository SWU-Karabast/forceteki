import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class IdenVersioInfernoSquadCommander extends LeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '2048866729',
            internalName: 'iden-versio#inferno-squad-commander',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Heal 1 from base if an opponent\'s unit was defeated this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.unitsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.player.opponent),
                onTrue: AbilityHelper.immediateEffects.heal((context) => {
                    return { amount: 1, target: context.player.base };
                }),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'When an opponent\'s unit is defeated, heal 1 from base',
            when: {
                onCardDefeated: (event, context) => event.card.controller !== context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => {
                return { amount: 1, target: context.player.base };
            }),
        });
    }
}
