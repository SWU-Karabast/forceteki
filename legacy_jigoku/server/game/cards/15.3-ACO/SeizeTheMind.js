const DrawCard = require('../../drawcard.js');
const { Players, CardTypes, Durations } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class SeizeTheMind extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Take control of a character',
            condition: () => this.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: card => !card.isUnique(),
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.loseHonor(context => ({
                        target: context.player,
                        amount: context.target.fate
                    })),
                    AbilityDsl.actions.cardLastingEffect(context => ({
                        effect: AbilityDsl.effects.takeControl(context.player),
                        duration: Durations.UntilEndOfConflict
                    }))
                ])
            },
            effect: 'take control of {0}{1}{2}{3}',
            effectArgs: context => context.target.getFate() > 0 ? [' and lose ', context.target.getFate(), ' honor'] : ['', '', '']
        });
    }

    isTemptationsMaho() {
        return true;
    }
}

SeizeTheMind.id = 'seize-the-mind';

module.exports = SeizeTheMind;
