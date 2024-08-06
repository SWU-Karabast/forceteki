const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { AbilityTypes, CardTypes } = require('../../Constants.js');

class Daikyu extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            condition: (context) => context.source.parent && context.source.controller.firstPlayer,
            effect: AbilityDsl.effects.modifyMilitarySkill(2)
        });

        this.whileAttached({
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Reaction, {
                title: 'Bow a character',
                when: {
                    onConflictDeclared: (event, context) =>
                        context.source.isParticipating() && context.game.isDuringConflict('military'),
                    onDefendersDeclared: (event, context) =>
                        context.source.isParticipating() && context.game.isDuringConflict('military'),
                    onMoveToConflict: (event, context) =>
                        context.source.isParticipating() && context.game.isDuringConflict('military')
                },
                target: {
                    cardType: CardTypes.Character,
                    cardCondition: (card, context) =>
                        card.getMilitarySkill() < context.source.getMilitarySkill() && card.isParticipating(),
                    gameAction: AbilityDsl.actions.bow()
                }
            })
        });
    }
}

Daikyu.id = 'daikyu';

module.exports = Daikyu;
