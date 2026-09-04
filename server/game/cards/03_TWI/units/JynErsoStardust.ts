import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class JynErsoStardust extends NonLeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7099699830',
            internalName: 'jyn-erso#stardust'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While an enemy unit has been defeated this phase, this unit gets +1/+0 and gains ${TextHelper.Saboteur}`,
            condition: (context) => this.cardsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.player.opponent),
            ongoingEffect: [
                AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
            ]
        });
    }
}

