const DrawCard = require('../../drawcard.js');
const AbilityDsl = require('../../abilitydsl');

const { Locations, Players, CardTypes } = require('../../Constants');

class CycleOfRebirth extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Shuffle this and target into deck',
            max: AbilityDsl.limit.perRound(1),
            target: {
                location: Locations.Provinces,
                controller: Players.Any,
                cardCondition: card => card.type !== CardTypes.Province && card.type !== CardTypes.Stronghold
            },
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.multiple([
                    AbilityDsl.actions.moveCard(context => ({
                        destination: Locations.DynastyDeck,
                        target: context.target,
                        shuffle: true,
                        bottom: true
                    })),
                    AbilityDsl.actions.moveCard(context => ({
                        destination: Locations.DynastyDeck,
                        target: context.source,
                        shuffle: true,
                        bottom: true
                    }))
                ]),
                AbilityDsl.actions.refillFaceup(context => ({
                    target: [context.target.controller, context.source.controller],
                    location: context.game.getProvinceArray()
                }))
            ]),
            effect: 'shuffle {1}{3}{4} into {2}\'s dynasty deck{5}{6}{7}{8}{9}',
            effectArgs: context => [
                context.target,
                context.target.controller,
                context.target.controller === context.source.controller ? ' and ' : '',
                context.target.controller === context.source.controller ? context.source : '',
                context.target.controller !== context.source.controller ? '. ' : '',
                context.target.controller !== context.source.controller ? context.source : '',
                context.target.controller !== context.source.controller ? ' is shuffled into ' : '',
                context.target.controller !== context.source.controller ? context.source.controller : '',
                context.target.controller !== context.source.controller ? '\'s dynasty deck' : '',
                context.source.controller
            ]
        });
    }
}

CycleOfRebirth.id = 'cycle-of-rebirth';

module.exports = CycleOfRebirth;

