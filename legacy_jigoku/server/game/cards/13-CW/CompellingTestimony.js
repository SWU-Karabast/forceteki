const DrawCard = require('../../drawcard.js');
const { CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class CompellingTestimony extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give a character -4 political',
            condition: () => this.game.isDuringConflict('political'),
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    effect: AbilityDsl.effects.modifyPoliticalSkill(-4)
                })
            },
            effect: 'give {0} -4{1}',
            effectArgs: () => ['political']
        });
    }
}

CompellingTestimony.id = 'compelling-testimony';

module.exports = CompellingTestimony;
