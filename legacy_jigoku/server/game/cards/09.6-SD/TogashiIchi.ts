import { CardTypes, Locations } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class TogashiIchi extends DrawCard {
    static id = 'togashi-ichi';

    setupCardAbilities() {
        this.action({
            title: 'Break the province',
            condition: (context) =>
                context.source.isAttacking() &&
                this.game.currentConflict.getNumberOfCardsPlayed(context.player) +
                    this.game.currentConflict.getNumberOfCardsPlayed(context.player.opponent) >=
                    10,
            effect: 'break an attacked province',
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                activePromptTitle: 'Choose an attacked province',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: (card) => card.isConflictProvince() && card.location !== Locations.StrongholdProvince,
                message: '{0} breaks {1}',
                messageArgs: (cards) => [context.player, cards],
                gameAction: AbilityDsl.actions.breakProvince()
            }))
        });
    }
}
