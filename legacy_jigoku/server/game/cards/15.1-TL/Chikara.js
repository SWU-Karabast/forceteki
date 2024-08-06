const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');
const { AbilityTypes, CardTypes } = require('../../Constants');

class Chikara extends DrawCard {
    setupCardAbilities() {
        this.attachmentConditions({
            myControl: true,
            unique: true,
            faction: 'crab'
        });

        this.grantedAbilityLimits = {};
        this.whileAttached({
            match: card => card.hasTrait('champion'),
            effect: AbilityDsl.effects.gainAbility(AbilityTypes.Reaction, {
                title: 'Return all fate from, then sacrifice a character',
                when: {
                    afterConflict: (event, context) => {
                        return event.conflict.winner === context.source.controller && context.source.isParticipating();
                    }
                },
                printedAbility: false,
                effect: 'force {1} to sacrifice {0}, returning all its fate to {1}\'s fate pool',
                effectArgs: context => [context.target.controller],
                target: {
                    cardType: CardTypes.Character,
                    cardCondition: card => card.isParticipating(),
                    gameAction: AbilityDsl.actions.sequential([
                        AbilityDsl.actions.removeFate(context => ({
                            amount: context.target.getFate(),
                            recipient: context.target.owner
                        })),
                        AbilityDsl.actions.sacrifice(context => ({
                            target: context.target
                        }))
                    ])
                }
            })
        });
    }
}

Chikara.id = 'chikara';

module.exports = Chikara;
