import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class LuminousBeings extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6801641285',
            internalName: 'luminous-beings'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Put up to 3 Force units from your discard pile on the bottom of your deck in a random order. Give that many units +4/+4 for this phase.',
            targetResolvers: {
                discard: {
                    mode: TargetMode.UpTo,
                    numCards: 3,
                    zoneFilter: ZoneName.Discard,
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    canChooseNoCards: true,
                    cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Force),
                    immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck({
                        shuffleMovedCards: true
                    })
                },
                units: {
                    mode: TargetMode.UpToVariable,
                    numCardsFunc: (context) => context.targets.discard.length,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 4 })
                    })
                }
            }
        });
    }
}