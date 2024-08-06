const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl.js');

class AdornedTemple extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Draw cards',
            when: {
                onMoveFate: (event, context) => {
                    return (
                        event.fate > 0 &&
                        event.recipient &&
                        event.recipient.controller === context.player &&
                        event.context.ability.isCardAbility()
                    );
                }
            },
            effect: 'draw {1} card{2}',
            effectArgs: (context) => (context.event.recipient.isOrdinary() ? ['2', 's'] : ['a', '']),
            gameAction: AbilityDsl.actions.draw((context) => ({
                target: context.player,
                // @ts-ignore
                amount: context.event.recipient.isOrdinary() ? 2 : 1
            }))
        });
    }
}

AdornedTemple.id = 'adorned-temple';

module.exports = AdornedTemple;
