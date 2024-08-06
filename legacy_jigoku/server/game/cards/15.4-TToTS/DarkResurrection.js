const DrawCard = require('../../drawcard.js');
const { Locations, Players, TargetModes, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class DarkResurrection extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Put characters into play from your discard',
            condition: () => this.game.isDuringConflict('military'),
            target:{
                activePromptTitle: 'Choose up to three characters',
                numCards: 3,
                mode: TargetModes.UpTo,
                optional: true,
                cardType: CardTypes.Character,
                location: [Locations.DynastyDiscardPile],
                controller: Players.Self,
                cardCondition: card => card.type === CardTypes.Character && card.printedCost <= 3,
                gameAction: AbilityDsl.actions.putIntoConflict({ status: 'dishonored' })

            }
        });
    }

    isTemptationsMaho() {
        return true;
    }
}

DarkResurrection.id = 'dark-resurrection';

module.exports = DarkResurrection;

