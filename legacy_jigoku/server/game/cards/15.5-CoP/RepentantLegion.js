const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations } = require('../../Constants.js');

class RepentantLegion extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'fill provinces with a card',
            when: {
                onBreakProvince: (event, context) => context.source.isParticipating() && event.conflict.getConflictProvinces().some(a => a.owner !== context.player)
            },
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.moveCard(context => ({
                    target: context.player.dynastyDeck.first(),
                    destination: Locations.ProvinceOne
                })),
                AbilityDsl.actions.moveCard(context => ({
                    target: context.player.dynastyDeck.first(),
                    destination: Locations.ProvinceTwo
                })),
                AbilityDsl.actions.moveCard(context => ({
                    target: context.player.dynastyDeck.first(),
                    destination: Locations.ProvinceThree
                })),
                AbilityDsl.actions.moveCard(context => ({
                    target: context.player.dynastyDeck.first(),
                    destination: Locations.ProvinceFour
                }))
            ]),
            effect: 'put 1 card into each of their non-stronghold provinces.'
        });
    }
}

RepentantLegion.id = 'repentant-legion';

module.exports = RepentantLegion;
