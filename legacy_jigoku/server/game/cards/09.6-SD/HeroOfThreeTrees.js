const DrawCard = require('../../drawcard.js');
const { TargetModes, CardTypes, Locations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class HeroOfThreeTrees extends DrawCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Gain 1 honor or reduce the attacked province strength',
            condition: context => context.source.isParticipating()
                && context.player.opponent
                && context.player.hand.size() < context.player.opponent.hand.size(),
            target: {
                mode: TargetModes.Select,
                choices: {
                    'Gain 1 honor': AbilityDsl.actions.gainHonor(),
                    'Lower attacked province\'s strength by 1': AbilityDsl.actions.selectCard(context => ({
                        activePromptTitle: 'Choose an attacked province',
                        hidePromptIfSingleCard: true,
                        cardType: CardTypes.Province,
                        location: Locations.Provinces,
                        cardCondition: card => card.isConflictProvince(),
                        subActionProperties: card => {
                            context.target = card;
                            return ({ target: card });
                        },
                        message: '{0} reduces the strength of {1} by 1',
                        messageArgs: cards => [context.player, cards],
                        gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                            effect: (
                                context.target.getStrength() > 1 ?
                                    ability.effects.modifyProvinceStrength(-1) : []
                            )
                        }))
                    }))
                }
            },
            effect: '{1}{2}',
            effectArgs: context => [context.select === 'Gain 1 honor' ? 'gain 1 honor' : 'reduce the strength of ',
                context.select === 'Gain 1 honor' ? '' : 'an attacked province by 1']
        });
    }
}

HeroOfThreeTrees.id = 'hero-of-three-trees';

module.exports = HeroOfThreeTrees;
