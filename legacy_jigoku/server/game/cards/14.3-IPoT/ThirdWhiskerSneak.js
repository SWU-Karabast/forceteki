const DrawCard = require('../../drawcard.js');
const { Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class ThirdWhiskerSneak extends DrawCard {
    setupCardAbilities() {
        this.persistentEffect({
            effect: [
                AbilityDsl.effects.immunity({
                    restricts: 'maho'
                }),
                AbilityDsl.effects.immunity({
                    restricts: 'shadowlands'
                })]
        }),

        this.reaction({
            title: 'Add a card to your hand',
            when: {
                afterConflict: (event, context) => event.conflict.winner === context.source.controller && event.conflict.conflictUnopposed && context.source.isParticipating()
            },
            effect: 'look at the top {1} cards of their conflict deck',
            effectArgs: context => [context.player.getProvinces(a => !a.isBroken).length],
            gameAction: AbilityDsl.actions.deckSearch({
                amount: (context) => context.player.getProvinces(a => !a.isBroken).length,
                reveal: false,
                gameAction: AbilityDsl.actions.moveCard({
                    destination: Locations.Hand
                })
            })
        });
    }
}

ThirdWhiskerSneak.id = 'third-whisker-sneak';

module.exports = ThirdWhiskerSneak;
