const DrawCard = require('../../drawcard.js');
const { Locations, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class DisdainfulRemark extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Add Province Strength',
            condition: context => context.player.anyCardsInPlay(card => card.isParticipating() && card.hasTrait('courtier')) &&
                                  context.player.opponent && context.player.opponent.hand.size() > 0,
            effect: 'increase the strength of an attacked province',
            gameAction: AbilityDsl.actions.selectCard(context => ({
                activePromptTitle: 'Choose an attacked province',
                hidePromptIfSingleCard: true,
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: card => card.isConflictProvince(),
                message: '{0} increases the strength of {1} by {2}',
                messageArgs: cards => [context.player, cards, context.player.opponent.hand.size()],
                gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                    targetLocation: Locations.Provinces,
                    effect: AbilityDsl.effects.modifyProvinceStrength(context.player.opponent.hand.size())
                }))
            }))
        });
    }
}

DisdainfulRemark.id = 'disdainful-remark';

module.exports = DisdainfulRemark;
