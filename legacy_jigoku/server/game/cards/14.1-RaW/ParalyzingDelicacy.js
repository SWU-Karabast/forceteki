const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { Locations, CardTypes } = require('../../Constants');

class ParalyzingDelicacy extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: '-X military equal to facedown provinces',
            condition: context => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                    effect: AbilityDsl.effects.modifyMilitarySkill(-this.getFaceDownProvinceCards(context))
                }))
            },
            effect: 'give {1} -{2}{3}',
            effectArgs: context => [context.target, this.getFaceDownProvinceCards(context), 'military']
        });
    }

    getFaceDownProvinceCards(context) {
        return context.target.controller
            .getDynastyCardsInProvince(Locations.Provinces)
            .filter(card => card.isFacedown() && card.controller === context.target.controller).length;
    }
}

ParalyzingDelicacy.id = 'paralyzing-delicacy';

module.exports = ParalyzingDelicacy;
