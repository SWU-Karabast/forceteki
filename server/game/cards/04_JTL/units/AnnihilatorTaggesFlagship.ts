import AbilityHelper from '../../../AbilityHelper';
import * as Helpers from '../../../core/utils/Helpers.js';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class AnnihilatorTaggesFlagship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8582806124',
            internalName: 'annihilator#tagges-flagship'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Defeat an enemy unit',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onCardDefeated: (event, context) => event.card === context.source
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `Discard all cards named ${ifYouDoContext.target.title} from the opponent's hand and deck`,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.conditional({
                        condition: ifYouDoContext.player.opponent.hand.length > 0,
                        onTrue: AbilityHelper.immediateEffects.sequential((context) => {
                            const matchingCardNames = context.player.opponent.hand.filter((card) => card.title === ifYouDoContext.target.title);
                            return [
                                AbilityHelper.immediateEffects.lookAt((context) => ({
                                    target: context.player.opponent.hand,
                                    useDisplayPrompt: true
                                })),
                                AbilityHelper.immediateEffects.simultaneous(
                                    Helpers.asArray(matchingCardNames).map((target) =>
                                        AbilityHelper.immediateEffects.discardSpecificCard({
                                            target: target
                                        })
                                    )
                                )
                            ];
                        }),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: ifYouDoContext.player.opponent.drawDeck.length > 0,
                        onTrue: AbilityHelper.immediateEffects.deckSearch({
                            targetMode: TargetMode.Unlimited,
                            choosingPlayer: ifYouDoContext.player,
                            player: ifYouDoContext.player.opponent,
                            cardCondition: (card) => card.title === ifYouDoContext.target.title,
                            shuffleWhenDone: true,
                            selectedCardsImmediateEffect: AbilityHelper.immediateEffects.discardSpecificCard()
                        }),
                        onFalse: AbilityHelper.immediateEffects.noAction()
                    })
                ])
            })
        });
    }
}