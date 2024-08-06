const DrawCard = require('../../drawcard.js');
const { Phases, CardTypes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class EtherealAlignment extends DrawCard {
    setupCardAbilities() {
        this.interrupt({
            title: 'Restore a province',
            when : {
                onPhaseEnded: event => event.phase === Phases.Conflict
            },
            target: {
                location: Locations.Provinces,
                cardType: CardTypes.Province,
                cardCondition: (card, context) => {
                    return card.isBroken && card.element.some(element => {
                        if(element === 'all') {
                            return true;
                        }
                        return this.game.rings[element].isConsideredClaimed(context.player);
                    });
                },
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.restoreProvince(),
                    AbilityDsl.actions.moveCard(context => ({
                        target: context.source,
                        destination: Locations.RemovedFromGame
                    }))
                ])
            },
            effect: 'restore {0}'
        });
    }
}

EtherealAlignment.id = 'ethereal-alignment';

module.exports = EtherealAlignment;
