import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';
import type DrawCard from '../../drawcard';

export default class UpholdingAuthority extends ProvinceCard {
    static id = 'upholding-authority';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.player.role && context.player.role.hasTrait('earth'),
            effect: AbilityDsl.effects.modifyProvinceStrength(2)
        });

        let gameAction = AbilityDsl.actions.menuPrompt((context) => ({
            activePromptTitle: 'Choose how many cards to discard',
            choices: (properties) =>
                (context.game.currentConflict.attackingPlayer.hand as DrawCard[])
                    .filter((card) => card.name === properties.target[0].name)
                    .map((_, idx) => (idx + 1).toString()),
            gameAction: AbilityDsl.actions.discardCard(),
            choiceHandler: (choice, displayMessage, properties) => {
                let chosenCard = properties.target[0];
                if (displayMessage) {
                    this.game.addMessage(
                        '{0} chooses to discard {1} cop{2} of {3}',
                        context.player,
                        choice,
                        choice === '1' ? 'y' : 'ies',
                        chosenCard
                    );
                }
                return {
                    target: context.game.currentConflict.attackingPlayer.hand
                        .filter((card) => card.name === chosenCard.name)
                        .slice(0, parseInt(choice))
                };
            }
        }));

        this.interrupt({
            title: "Look at the attacking player's hand and discard all copies of a card",
            when: {
                onBreakProvince: (event, context) =>
                    event.card === context.source &&
                    context.game.currentConflict &&
                    context.game.currentConflict.attackingPlayer &&
                    context.game.currentConflict.attackingPlayer.hand.size() > 0
            },
            effect: "look at the attacking player's hand and choose a card to be discarded",
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.lookAt((context) => ({
                    target: context.game.currentConflict.attackingPlayer.hand.sortBy((card) => card.name),
                    message: '{0} reveals their hand: {1}',
                    messageArgs: (cards) => [context.game.currentConflict.attackingPlayer, cards]
                })),
                AbilityDsl.actions.cardMenu((context) => ({
                    activePromptTitle: 'Choose a card to discard',
                    cards: context.game.currentConflict.attackingPlayer.hand.sortBy((card) => card.name),
                    targets: true,
                    gameAction: gameAction,
                    choices: context.choosingPlayerOverride ? [] : ["Don't discard anything"],
                    handlers: context.choosingPlayerOverride
                        ? []
                        : [() => context.game.addMessage('{0} chooses not to discard anything', context.player)]
                }))
            ])
        });
    }
}
