const DrawCard = require('../../drawcard.js');
const { Players, TargetModes, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class RelentlessInquisitor extends DrawCard {
    setupCardAbilities() {
        this.action({
            title: 'Remove a fate from or bow a character',
            condition: context => context.source.isParticipating(),
            targets: {
                character: {
                    cardType: CardTypes.Character,
                    controller: Players.Opponent,
                    cardCondition: card => card.isParticipating() && !card.bowed
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: 'character',
                    player: Players.Opponent,
                    choices: {
                        'Remove a fate from this character': AbilityDsl.actions.removeFate(context => ({ target: context.targets.character })),
                        'Bow this character': AbilityDsl.actions.bow(context => ({ target: context.targets.character }))
                    }
                }
            }
        });
    }
}

RelentlessInquisitor.id = 'relentless-inquisitor';

module.exports = RelentlessInquisitor;
