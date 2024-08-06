const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { CardTypes, Players } = require('../../Constants');

class FinalWhisper extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Copy status token',
            when: {
                onStatusTokenGained: (event, context) =>
                    event.card.type === CardTypes.Character && event.card.controller !== context.source
            },
            target: {
                cardType: CardTypes.Character,
                player: Players.Opponent,
                controller: Players.Opponent,
                cardCondition: (card, context) =>
                    card !== context.event.card && card.controller === context.event.card.controller,
                gameAction: AbilityDsl.actions.gainStatusToken((context) => ({
                    // @ts-ignore
                    token: context.event.token.grantedStatus || context.event.token
                }))
            }
        });
    }
}

FinalWhisper.id = 'final-whisper';

module.exports = FinalWhisper;
