const DrawCard = require('../../drawcard.js');
const { CardTypes, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class CelebratedRenown extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Honor a character',
            target: {
                controller: Players.Any,
                cardType: CardTypes.Character,
                cardCondition: (card, context) => {
                    let charactersInPlay = context.game.findAnyCardsInPlay(c => c.type === CardTypes.Character);
                    return card.getFate() === Math.max(...charactersInPlay.map(c => c.getFate()));
                },
                gameAction: AbilityDsl.actions.honor()
            }
        });
    }
}

CelebratedRenown.id = 'celebrated-renown';

module.exports = CelebratedRenown;
