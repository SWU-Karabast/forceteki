const DrawCard = require('../../drawcard.js');
const { Players, CardTypes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class DojiDiplomat extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Reveal provinces',
            when: {
                onCharacterEntersPlay: (event, context) => event.card === context.source
            },
            targets: {
                myProvince: {
                    cardType: CardTypes.Province,
                    controller: Players.Opponent,
                    location: Locations.Provinces,
                    gameAction: AbilityDsl.actions.reveal()
                },
                oppProvince: {
                    player: Players.Opponent,
                    controller: Players.Self,
                    cardType: CardTypes.Province,
                    location: Locations.Provinces,
                    gameAction: AbilityDsl.actions.reveal()
                }
            },
            effect: 'reveal {1} and {2}',
            effectArgs: context => [context.targets.myProvince, context.targets.oppProvince]
        });
    }
}

DojiDiplomat.id = 'doji-diplomat';

module.exports = DojiDiplomat;
