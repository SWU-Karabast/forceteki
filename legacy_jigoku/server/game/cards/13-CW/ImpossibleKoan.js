const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class ImpossibleKoan extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Make all participating characters have base skills of 1/1',
            condition: () => this.game.isDuringConflict(),
            gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                target: context.game.findAnyCardsInPlay(card => card.type === CardTypes.Character),
                effect: [
                    AbilityDsl.effects.setBaseMilitarySkill(1),
                    AbilityDsl.effects.setBasePoliticalSkill(1)
                ]
            })),
            effect: 'make all characters have base skills of 1{1}/1{2}',
            effectArgs: () => ['military', 'political']
        });
    }
}

ImpossibleKoan.id = 'impossible-koan';

module.exports = ImpossibleKoan;
