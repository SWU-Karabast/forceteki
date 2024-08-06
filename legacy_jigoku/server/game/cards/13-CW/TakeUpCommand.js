const { Players, CardTypes, AbilityTypes } = require('../../Constants');
const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

class TakeUpCommand extends DrawCard {
    setupCardAbilities() {
        this.whileAttached({
            effect: [
                AbilityDsl.effects.addTrait('commander'),
                AbilityDsl.effects.gainAbility(AbilityTypes.Action, {
                    title: 'Ready character and move to conflict',
                    condition: context => context.source.isParticipating(),
                    target: {
                        cardType: CardTypes.Character,
                        controller: Players.Self,
                        cardCondition: card => card.hasTrait('bushi') && card.costLessThan(3),
                        gameAction: [AbilityDsl.actions.ready(), AbilityDsl.actions.moveToConflict()]
                    },
                    effect: 'ready {0} and move it into the conflict'
                })
            ]
        });
    }
}

TakeUpCommand.id = 'take-up-command';

module.exports = TakeUpCommand;
