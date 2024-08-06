const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Locations } = require('../../Constants');

class AppealToSympathy extends DrawCard {
    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel an event',
            when: {
                onInitiateAbilityEffects: (event) => event.card.type === CardTypes.Event
            },
            cannotBeMirrored: true,
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.cancel(),
                AbilityDsl.actions.moveCard((context) => ({
                    // @ts-ignore
                    target: context.event.card,
                    // @ts-ignore
                    destination: context.event.card.isConflict ? Locations.ConflictDeck : Locations.DynastyDiscardPile
                }))
            ]),
            effect: 'cancel the effects of {1}{2}{3}{4}',
            effectArgs: (context) => [
                context.event.card,
                context.event.card.isConflict ? ' and place it on the top of ' : '',
                context.event.card.isConflict ? context.player.opponent : '',
                context.event.card.isConflict ? "'s conflict deck" : ''
            ]
        });
    }
}

AppealToSympathy.id = 'appeal-to-sympathy';

module.exports = AppealToSympathy;
