const DrawCard = require('../../../drawcard.js');
const { CardTypes } = require('../../../Constants');
const AbilityDsl = require('../../../abilitydsl');

class AsahinaDiviner extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give a participating character +3 glory',
            condition: context => context.game.isDuringConflict(),
            max: AbilityDsl.limit.perConflict(1),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card.isParticipating() && card !== context.source,
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    effect: AbilityDsl.effects.modifyGlory(3)
                }))
            },
            effect: 'give {0} +3 glory until the end of the conflict'
        });
    }
}

AsahinaDiviner.id = 'asahina-diviner';
module.exports = AsahinaDiviner;
