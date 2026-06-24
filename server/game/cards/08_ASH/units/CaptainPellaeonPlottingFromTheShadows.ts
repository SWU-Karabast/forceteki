import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class CaptainPellaeonPlottingFromTheShadows extends NonLeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '9744743320',
            internalName: 'captain-pellaeon#plotting-from-the-shadows',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = abilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While a leader unit has been defeated this phase, this unit gains ${TextHelper.Raid(3)}`,
            condition: (context) => this.cardsDefeatedThisPhaseWatcher.someUnitDefeatedThisPhase((e) => EnumHelpers.isLeaderUnit(e.lastKnownInformation.type)),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 3 })
        });
    }
}