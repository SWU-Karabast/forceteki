import AbilityHelper from '../../../AbilityHelper';
import { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, PlayType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';
import type Player from '../../../core/Player';
import OngoingEffectLibrary from '../../../ongoingEffects/OngoingEffectLibrary';

export default class CobbVanthTheMarshal extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9151673075',
            internalName: 'cobb-vanth#the-marshal'
        };
    }

    public override setupCardAbilities () {
        this.addWhenDefeatedAbility({
            title: 'Search the top 10 cards of your deck for a unit that costs 2 or less and discard it. For this phase, you may play that card from your discard pile for free.',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 10,
                cardCondition: (card) => card.isUnit() && card.cost <= 2,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.discardSpecificCard(),
                    AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: OngoingEffectLibrary.canPlayFromOutOfPlay(
                                (player: Player, card: Card) => player === card.controller,
                                PlayType.PlayFromOutOfPlay
                            ),
                        }),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect((deckSearchContext) => ({
                            effect: OngoingEffectLibrary.freeCost({
                                match: (card) => deckSearchContext.targets.includes(card)
                            })
                        })),
                    ]),
                ])
            })
        });
    }
}

CobbVanthTheMarshal.implemented = true;
