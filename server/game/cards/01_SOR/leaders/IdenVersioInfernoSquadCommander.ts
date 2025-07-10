import AbilityHelper from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import * as EnumHelpers from '../../../core/utils/EnumHelpers.js';

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

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Heal 1 from base if an opponent\'s unit was defeated this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.unitsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.player.opponent),
                onTrue: AbilityHelper.immediateEffects.heal((context) => {
                    return { amount: 1, target: context.player.base };
                }),
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'When an opponent\'s unit is defeated, heal 1 from base',
            when: {
                onCardDefeated: (event, context) => EnumHelpers.isUnit(event.lastKnownInformation.type) && event.lastKnownInformation.controller !== context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.heal((context) => {
                return { amount: 1, target: context.player.base };
            }),
        });
    }
}
