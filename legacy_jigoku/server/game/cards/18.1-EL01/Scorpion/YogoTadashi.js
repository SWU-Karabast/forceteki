const DrawCard = require('../../../drawcard.js');
const AbilityDsl = require('../../../abilitydsl.js');
const { CardTypes, Players } = require('../../../Constants.js');

class YogoTadashi extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Prevent a character from being targeted by events',
            when: {
                onConflictDeclared: (event, context) => event.attackers.includes(context.source),
                onDefendersDeclared: (event, context) => event.defenders.includes(context.source),
                onMoveToConflict: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                gameAction: AbilityDsl.actions.cardLastingEffect(context => ({
                    target: context.target,
                    effect: AbilityDsl.effects.cardCannot({
                        cannot: 'target',
                        restricts: 'opponentsEvents'
                    })
                }))
            },
            effect: 'prevent {0} from being targeted by events played by {1}',
            effectArgs: context => [context.player.opponent]
        });
    }
}

YogoTadashi.id = 'yogo-tadashi';
module.exports = YogoTadashi;
