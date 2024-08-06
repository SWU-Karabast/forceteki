const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class AkodoGunso extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Refill province faceup',
            when: {
                onCharacterEntersPlay: (event, context) =>
                    event.card === context.source && context.game.getProvinceArray().includes(event.originalLocation)
            },
            // @ts-ignore
            gameAction: AbilityDsl.actions.refillFaceup((context) => ({ location: context.event.originalLocation }))
        });
    }
}

AkodoGunso.id = 'akodo-gunso';

module.exports = AkodoGunso;
