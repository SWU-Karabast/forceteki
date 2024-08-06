const DrawCard = require('../../drawcard.js');
const { CardTypes, Phases } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class ShadowedVillage extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Draw cards',
            when: {
                onMoveFate: (event, context) =>
                    context.game.currentPhase !== Phases.Fate &&
                    event.origin &&
                    event.origin.type === CardTypes.Character &&
                    event.origin.controller === context.player &&
                    event.fate > 0
            },
            effect: 'draw {1} card{2}',
            effectArgs: (context) => (context.event.origin.isDishonored ? ['2', 's'] : ['a', '']),
            gameAction: AbilityDsl.actions.draw((context) => ({
                target: context.player,
                // @ts-ignore
                amount: context.event.origin.isDishonored ? 2 : 1
            }))
        });
    }
}

ShadowedVillage.id = 'shadowed-village';

module.exports = ShadowedVillage;
