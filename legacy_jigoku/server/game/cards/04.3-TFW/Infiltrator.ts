import { PlayTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class Infiltrator extends DrawCard {
    static id = 'infiltrator';

    setupCardAbilities() {
        this.action({
            title: "Look at the top card of an opponent's deck and play or discard it",
            condition: () => this.game.isDuringConflict(),
            effect: "look at the top card of an opponent's deck and play or discard it",
            gameAction: AbilityDsl.actions.chooseAction((context) => {
                const topCard = context.player.opponent?.conflictDeck.first();
                return {
                    activePromptTitle: topCard && 'Choose an action for ' + topCard.name,
                    options: {
                        'Play this card': {
                            action: AbilityDsl.actions.playCard({
                                target: topCard,
                                playType: PlayTypes.PlayFromHand,
                                source: this
                            })
                        },
                        'Discard this card': {
                            action: AbilityDsl.actions.discardCard({ target: topCard }),
                            message: '{0} chooses to discard {1}'
                        }
                    }
                };
            })
        });
    }

    canPlay(context, playType) {
        if (!context.player.opponent || context.player.showBid <= context.player.opponent.showBid) {
            return false;
        }
        return super.canPlay(context, playType);
    }
}
