const DrawCard = require('../../drawcard.js');
const { CardTypes, Phases, Players, TargetModes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class KamiOfAncientWisdom extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Give or take fate',
            when: {
                onMoveFate: (event, context) => context.game.currentPhase !== Phases.Fate &&
                    event.origin && event.origin.type === CardTypes.Character && event.fate > 0
            },
            targets: {
                character: {
                    controller: Players.Any,
                    cardType: CardTypes.Character
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: 'character',
                    choices: {
                        'Place 1 Fate': AbilityDsl.actions.placeFate(context => ({ target: context.targets.character })),
                        'Remove 1 Fate': AbilityDsl.actions.removeFate(context => ({ target: context.targets.character }))
                    }
                }
            }
        });
    }
}

KamiOfAncientWisdom.id = 'kami-of-ancient-wisdom';

module.exports = KamiOfAncientWisdom;
