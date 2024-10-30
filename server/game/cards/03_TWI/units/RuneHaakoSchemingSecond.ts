import AbilityHelper from '../../../AbilityHelper';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class RuneHaakoSchemingSecond extends NonLeaderUnitCard {
    private cardsLeftPlayThisPhaseWatcher: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5333016146',
            internalName: 'rune-haako#scheming-second',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsLeftPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsLeftPlayThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'If a friendly unit was defeated this phase, give a unit +2/+2 for this phase',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => {
                        const friendlyUnitsLeftPlayThisPhase = this.cardsLeftPlayThisPhaseWatcher.getCardsLeftPlayControlledByPlayer({ controller: context.source.controller, filter: (entry) => entry.card.isUnit() });
                        return friendlyUnitsLeftPlayThisPhase.length > 0;
                    },
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: -1 })
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}

RuneHaakoSchemingSecond.implemented = true;
