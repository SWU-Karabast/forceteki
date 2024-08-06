const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { TargetModes, CardTypes, Players } = require('../../Constants.js');

class EleganceAndGrace extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Ready characters',
            target: {
                mode: TargetModes.MaxStat,
                activePromptTitle: 'Choose characters',
                cardStat: (card) => card.getCost(),
                maxStat: () => 6,
                numCards: 2,
                cardType: CardTypes.Character,
                controller: Players.Any,
                cardCondition: (card) => card.isHonored,
                gameAction: AbilityDsl.actions.ready()
            }
        });
    }
}

EleganceAndGrace.id = 'elegance-and-grace';

module.exports = EleganceAndGrace;
