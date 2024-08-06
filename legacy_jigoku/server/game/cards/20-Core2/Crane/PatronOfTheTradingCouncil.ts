import { Locations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { Conflict } from '../../../conflict';

export default class PatronOfTheTradingCouncil extends DrawCard {
    static id = 'patron-of-the-trading-council';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) =>
                ((context.game.currentConflict as undefined | Conflict)?.getNumberOfParticipants((card) =>
                    card.hasTrait('mantis-clan')
                ) ?? 0) > 0,
            effect: AbilityDsl.effects.modifyBothSkills(1)
        });

        this.action({
            title: 'Give each player a valuable good',
            effect: 'give each player a valuable good',
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.lookAt((context) => ({
                    target: context.player.conflictDeck.first(2),
                    message: '{0} reveals the top {1} from their conflict deck: {2}',
                    messageArgs: (cards) => [context.player, cards.length, cards]
                })),
                AbilityDsl.actions.lookAt((context) => ({
                    target: context.player.opponent ? context.player.opponent.conflictDeck.first(2) : [],
                    message: '{0} reveals the top {1} from their conflict deck: {2}',
                    messageArgs: (cards) => [context.player.opponent, cards.length, cards]
                })),
                AbilityDsl.actions.cardMenu((context) => ({
                    activePromptTitle: 'Choose a card to give to yourself',
                    cards: context.player.conflictDeck.first(2),
                    targets: true,
                    message: '{0} chooses {1} to give to {2}',
                    messageArgs: (card, player) => [player, card, context.player],
                    gameAction: AbilityDsl.actions.moveCard({ destination: Locations.Hand })
                })),
                AbilityDsl.actions.cardMenu((context) => ({
                    activePromptTitle: 'Choose a card to give your opponent',
                    cards: context.player.opponent ? context.player.opponent.conflictDeck.first(2) : [],
                    targets: true,
                    message: '{0} chooses {1} to give to {2}',
                    messageArgs: (card, player) => [player, card, context.player.opponent],
                    gameAction: AbilityDsl.actions.moveCard({ destination: Locations.Hand })
                })),
                AbilityDsl.actions.shuffleDeck((context) => ({
                    target: context.player,
                    deck: Locations.ConflictDeck
                })),
                AbilityDsl.actions.shuffleDeck((context) => ({
                    target: context.player.opponent || [],
                    deck: Locations.ConflictDeck
                }))
            ])
        });
    }
}