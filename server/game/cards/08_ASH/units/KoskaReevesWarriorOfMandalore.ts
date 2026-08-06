import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class KoskaReevesWarriorOfMandalore extends NonLeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '6057506500',
            internalName: 'koska-reeves#warrior-of-mandalore',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = abilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control a token unit, this unit gains ${TextHelper.Sentinel}`,
            condition: (context) => context.player.hasSomeArenaUnit({ condition: (card) => card.isTokenUnit() }),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });

        registrar.addWhenPlayedAbility({
            title: 'Create a Mandalorian token',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    this.cardsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.player),
                onTrue: abilityHelper.immediateEffects.createMandalorian()
            })
        });
    }
}
