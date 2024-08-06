const DrawCard = require('../../drawcard.js');
const { Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class DiplomaticGiftGiver extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Put fate on characters',
            condition: context => context.source.isParticipating() && context.player.opponent && AbilityDsl.actions.loseFate().canAffect(context.player.opponent, context) && AbilityDsl.actions.loseFate().canAffect(context.player, context),
            targets: {
                firstCharacter: {
                    activePromptTitle: 'Choose a character to receive the gift of fate',
                    cardType: CardTypes.Character,
                    controller: context => context.player.firstPlayer ? Players.Opponent : Players.Self,
                    player: context => context.player.firstPlayer ? Players.Self : Players.Opponent,
                    gameAction: AbilityDsl.actions.placeFate(context => ({
                        origin: context.player.firstPlayer ? context.player : context.player.opponent
                    }))
                },
                secondCharacter: {
                    activePromptTitle: 'Choose a character to receive the gift of fate',
                    cardType: CardTypes.Character,
                    controller: context => context.player.firstPlayer ? Players.Self : Players.Opponent,
                    player: context => context.player.firstPlayer ? Players.Opponent : Players.Self,
                    gameAction: AbilityDsl.actions.placeFate(context => ({
                        origin: context.player.firstPlayer ? context.player.opponent : context.player
                    }))
                }
            },
            effect: 'gift a fate onto {1} and {2}',
            effectArgs: context => [context.targets.firstCharacter, context.targets.secondCharacter]
        });
    }
}

DiplomaticGiftGiver.id = 'diplomatic-gift-giver';

module.exports = DiplomaticGiftGiver;
