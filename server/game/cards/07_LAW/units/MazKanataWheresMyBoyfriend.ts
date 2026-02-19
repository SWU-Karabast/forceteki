import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import { PhaseName, Trait, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class MazKanataWheresMyBoyfriend extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4889454015',
            internalName: 'maz-kanata#wheres-my-boyfriend',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackCompletedAbility({
            title: 'If this unit survived, search the top 5 cards of your deck for an Underworld unit and play it. It costs 4 resources less and enters play ready. At the start of the regroup phase, put that unit on the bottom of your deck',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    !this.unitsDefeatedThisPhaseWatcher.wasDefeatedThisPhase(context.event.attack.attacker, context.event.attack.attackerInPlayId),
                onTrue: abilityHelper.immediateEffects.deckSearch({
                    searchCount: 5,
                    cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Underworld),
                    selectedCardsImmediateEffect: abilityHelper.immediateEffects.sequential([
                        abilityHelper.immediateEffects.playCardFromOutOfPlay({
                            adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 4 },
                            entersReady: true,
                            playAsType: WildcardCardType.Unit,
                        }),
                        abilityHelper.immediateEffects.delayedCardEffect({
                            title: 'Put that unit on the bottom of your deck',
                            when: {
                                onPhaseEnded: (context) => context.phase === PhaseName.Action
                            },
                            immediateEffect: abilityHelper.immediateEffects.moveToBottomOfDeck()
                        })
                    ])
                })
            })
        });
    }
}
