const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, Players, CardTypes, Elements } = require('../../Constants');

const elementKey = 'restored-heirloom-water';

class RestoredHeirloom extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Put into play',
            when: {
                onResolveRingElement: (event, context) => event.ring.element === this.getCurrentElementSymbol(elementKey) && event.player === context.player
            },
            effect: 'attach {1} to {0} instead of resolving the {2}',
            effectArgs: context => [context.source, context.event.ring],
            location: [Locations.Hand,Locations.ConflictDiscardPile],
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.cancel(context => ({
                    replacementGameAction: AbilityDsl.actions.attach({ attachment: context.source })
                }))
            }
        });
    }


    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Resolved Ring',
            element: Elements.Water
        });
        return symbols;
    }
}

RestoredHeirloom.id = 'restored-heirloom';

module.exports = RestoredHeirloom;
