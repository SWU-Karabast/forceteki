const DrawCard = require('../../drawcard.js');
const { Players, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class PreeminentDecree extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Give all participating characters a political penalty',
            condition: context => context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => {
                    return card.hasTrait('courtier') && card.isParticipating() && card.glory > 0;
                },
                gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                    target: context.game.currentConflict.getParticipants().filter(a => a !== context.target),
                    effect: AbilityDsl.effects.modifyPoliticalSkill(-1 * ((context.target && context.target.glory) || 0))
                }))
            },
            effect: 'give all participating characters except {0} -{1}{2}',
            effectArgs: context => [context.target.glory, 'political']
        });
    }
}

PreeminentDecree.id = 'preeminent-decree';

module.exports = PreeminentDecree;
