const AbilityDsl = require('../../abilitydsl.js');
const { CardTypes, Players } = require('../../Constants.js');
const DrawCard = require('../../drawcard.js');

class ShoshiNiKie extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'ready an ordinary character',
            cost: AbilityDsl.costs.selectedReveal({ cardCondition: card => card.isFacedown(), cardType: CardTypes.Province }),
            target: {
                cardCondition: card => card.isOrdinary(),
                cardType: CardTypes.Character,
                player: Players.Self,
                gameAction: AbilityDsl.actions.ready()
            }
        });
    }
}

ShoshiNiKie.id = 'shoshi-ni-kie';

module.exports = ShoshiNiKie;
