const DrawCard = require('../../drawcard.js');
const { Players, TargetModes, CardTypes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl');

class SilentEnforcer extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Bow or move home a character',
            when: {
                onCardPlayed: (event, context) => event.card.type === CardTypes.Event && event.card.controller === context.player && context.source.isParticipating()
            },
            targets: {
                character: {
                    cardType: CardTypes.Character,
                    controller: Players.Any,
                    cardCondition: card => card.isParticipating() && card.costLessThan(4)
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: 'character',
                    player: context => context.targets.character.controller === context.player ? Players.Self : Players.Opponent,
                    choices: {
                        'Move this character home': AbilityDsl.actions.sendHome(context => ({ target: context.targets.character })),
                        'Bow this character': AbilityDsl.actions.bow(context => ({ target: context.targets.character }))
                    }
                }
            }
        });
    }
}

SilentEnforcer.id = 'silent-enforcer';

module.exports = SilentEnforcer;
