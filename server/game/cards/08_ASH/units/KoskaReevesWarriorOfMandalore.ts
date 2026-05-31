import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class KoskaReevesWarriorOfMandalore extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: 'koska-reeves#warrior-of-mandalore-id',
            internalName: 'koska-reeves#warrior-of-mandalore',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = abilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control a token unit, this unit gains Sentinel',
            matchTarget: (card, context) => card === context.source,
            condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isTokenUnit() }),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });

        registrar.addWhenPlayedAbility({
            title: 'If a friendly unit was defeated this phase, create a Mandalorian token',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    this.unitsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.player),
                onTrue: abilityHelper.immediateEffects.createMandalorian()
            })
        });
    }
}
