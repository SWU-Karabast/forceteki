const DrawCard = require('../../drawcard.js');
const { CardTypes, Players } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class ShadowStep extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Remove a character from the game and put it into play',
            target: {
                cardType: CardTypes.Character,
                cardCondition: card => !card.hasTrait('mythic'),
                controller: Players.Self,
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.removeFromGame(context => ({
                        target: context.target
                    })),
                    AbilityDsl.actions.conditional({
                        condition: context => {
                            return context.target.hasTrait('shadow');
                        },
                        trueGameAction: AbilityDsl.actions.putIntoPlay(context => ({
                            target: context.target
                        })),
                        falseGameAction: AbilityDsl.actions.putIntoPlay(context => ({
                            target: context.target,
                            status: 'dishonored'
                        }))
                    })
                ])
            },
            effect: 'remove {0} from the game, then put it back into play'
        });
    }
}

ShadowStep.id = 'shadow-step';

module.exports = ShadowStep;
