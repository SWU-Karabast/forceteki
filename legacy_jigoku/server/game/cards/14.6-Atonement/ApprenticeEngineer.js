const DrawCard = require('../../drawcard.js');
const { Locations, Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ApprenticeEngineer extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Put a holding in a province',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Holding,
                controller: Players.Self,
                location: Locations.DynastyDiscardPile,
                gameAction: AbilityDsl.actions.selectCard(context => ({
                    activePromptTitle: 'Choose an unbroken province',
                    cardType: CardTypes.Province,
                    location: Locations.Provinces,
                    controller: Players.Self,
                    cardCondition: card => card.location !== Locations.StrongholdProvince && !card.isBroken,
                    message: '{0} places {1} in {2}, discarding {3}',
                    messageArgs: card => [context.player, context.target, card.facedown ? card.location : card, context.player.getDynastyCardsInProvince(card.location)],
                    subActionProperties: card => ({ destination: card.location, target: context.player.getDynastyCardsInProvince(card.location) }),
                    gameAction: AbilityDsl.actions.multiple([
                        AbilityDsl.actions.moveCard({
                            target: context.target,
                            faceup: true
                        }),
                        AbilityDsl.actions.discardCard()
                    ])
                }))
            },
            effect: 'put {0} into a province'
        });
    }
}

ApprenticeEngineer.id = 'apprentice-engineer';

module.exports = ApprenticeEngineer;
