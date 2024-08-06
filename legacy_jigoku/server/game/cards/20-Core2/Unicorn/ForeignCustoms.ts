import { CardTypes, Locations, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { Duel } from '../../../Duel';

export default class ForeignCustoms extends DrawCard {
    static id = 'foreign-customs';

    setupCardAbilities() {
        this.duelStrike({
            title: 'Put a character into play',
            duelCondition: (duel: Duel, context) => duel.loserController === context.player,
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                activePromptTitle: 'Choose a character',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Character,
                location: Locations.Provinces,
                controller: Players.Self,
                message: '{0} puts into the conflict {1} - they challenge the traditions of the empire',
                messageArgs: (cards) => [context.player, cards],
                subActionProperties: (card) => ({ target: card }),
                gameAction: AbilityDsl.actions.putIntoConflict({ status: 'dishonored' })
            }))
        });

        this.action({
            title: 'Ready a non-unicorn character',
            condition: (context) =>
                context.player.stronghold?.isFaction('unicorn') ||
                context.player.cardsInPlay.some((card: DrawCard) => card.isFaction('unicorn')),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isAtHome() && (!card.isFaction('unicorn') || card.hasTrait('gaijin')),
                gameAction: AbilityDsl.actions.ready()
            }
        });
    }
}
