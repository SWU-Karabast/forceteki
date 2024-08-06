const DrawCard = require('../../drawcard.js');
const { Phases, Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class HigesSermon extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Bow characters',
            phase: Phases.Draw,
            condition: context => context.player.cardsInPlay.any(a => !a.bowed) && context.player.opponent && context.player.opponent.cardsInPlay.any(a => !a.bowed),
            targets: {
                firstCharacter: {
                    activePromptTitle: 'Choose a character to bow',
                    cardType: CardTypes.Character,
                    controller: context => context.player.firstPlayer ? Players.Opponent : Players.Self,
                    player: context => context.player.firstPlayer ? Players.Self : Players.Opponent,
                    gameAction: AbilityDsl.actions.bow()
                },
                secondCharacter: {
                    activePromptTitle: 'Choose a character to bow',
                    cardType: CardTypes.Character,
                    controller: context => context.player.firstPlayer ? Players.Self : Players.Opponent,
                    player: context => context.player.firstPlayer ? Players.Opponent : Players.Self,
                    gameAction: AbilityDsl.actions.bow()
                }
            },
            effect: 'bow {1} and {2}',
            effectArgs: context => [context.targets.firstCharacter, context.targets.secondCharacter]
        });
    }
}

HigesSermon.id = 'hige-s-sermon';

module.exports = HigesSermon;


