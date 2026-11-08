import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import type { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class ObiWanKenobiISenseATrap extends NonLeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;
    private cardsEnteredPlayThisPhaseWatcher: CardsEnteredPlayThisPhaseWatcher;
    protected override getImplementationId() {
        return {
            id: '5262885755',
            internalName: 'obiwan-kenobi#i-sense-a-trap',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = abilityHelper.stateWatchers.cardsDefeatedThisPhase();
        this.cardsEnteredPlayThisPhaseWatcher = abilityHelper.stateWatchers.cardsEnteredPlayThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Choose one',
            optional: true,
            targetResolver: {
                mode: TargetMode.Select,
                choices: {
                    [`Play a unit that was defeated this phase from your discard pile. It costs ${TextHelper.resource(5)} less`]: abilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Choose a unit that was defeated this phase',
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: ZoneName.Discard,
                        controller: RelativePlayer.Self,
                        cardCondition: (card) => card.isUnit() && this.cardsDefeatedThisPhaseWatcher.wasDefeatedThisPhase(card),
                        immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                            playAsType: WildcardCardType.Unit,
                            adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 5 }
                        })
                    }),
                    ['Choose a unit that entered play this phase. It gets -5/-5 for this phase']: abilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Choose a unit that entered play this phase',
                        cardTypeFilter: WildcardCardType.Unit,
                        cardCondition: (card) =>
                            this.cardsEnteredPlayThisPhaseWatcher
                                .getCardsEnteredPlay((entry) => entry.card === card)
                                .length > 0,
                        immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: abilityHelper.ongoingEffects.modifyStats({ power: -5, hp: -5 })
                        })
                    })
                }
            }
        });
    }
}