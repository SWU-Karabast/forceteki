const DrawCard = require('../../drawcard.js');
const { Players, CardTypes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class DaidojiYari extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            condition: context => context.player.opponent && context.player.showBid < context.player.opponent.showBid,
            targetController: Players.Opponent,
            targetLocation: Locations.PlayArea,
            match: card => card.type === CardTypes.Character,
            effect: AbilityDsl.effects.loseKeyword('covert')
        });
    }
}

DaidojiYari.id = 'daidoji-yari';

module.exports = DaidojiYari;
