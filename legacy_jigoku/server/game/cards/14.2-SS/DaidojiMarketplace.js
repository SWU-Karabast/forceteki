const DrawCard = require('../../drawcard.js');
const { Phases } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class DaidojiMarketplace extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Reveal this holding\'s province',
            when: {
                onPhaseStarted: event => event.phase === Phases.Conflict
            },
            gameAction: AbilityDsl.actions.reveal(context => ({
                target: context.player.getProvinceCardInProvince(context.source.location)
            })),
            effect: 'reveal {1}',
            effectArgs: context => context.player.getProvinceCardInProvince(context.source.location)
        });
    }
}

DaidojiMarketplace.id = 'daidoji-marketplace';

module.exports = DaidojiMarketplace;
