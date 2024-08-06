import { CardTypes, Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class ShowMeYourStance extends DrawCard {
    static id = 'show-me-your-stance';

    setupCardAbilities() {
        this.duelChallenge({
            title: 'Apply status tokens to the duel',
            gameAction: AbilityDsl.actions.duelLastingEffect((context) => ({
                target: (context as any).event.duel,
                effect: AbilityDsl.effects.applyStatusTokensToDuel(),
                duration: Durations.UntilEndOfDuel
            })),
            effect: 'have status tokens count when resolving this duel'
        });

        this.action({
            title: 'Send a character home',
            condition: (context) => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) =>
                    card.isAttacking() &&
                    context.game.currentConflict
                        .getCharacters(context.player)
                        .some((myCard) => myCard.hasTrait('duelist') && myCard.glory >= card.glory),
                gameAction: AbilityDsl.actions.sendHome()
            }
        });
    }
}
