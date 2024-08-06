const DrawCard = require('../../drawcard.js');
const { CardTypes, TargetModes } = require('../../Constants');
const AbilityDsl = require('../../abilitydsl.js');

class TogashiDreamer extends DrawCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Move a fate from a character to a ring',
            when: {
                onCardPlayed: (event, context) => event.player === context.player && event.card.hasTrait('kiho') && context.source.isParticipating()
            },
            targets: {
                character: {
                    cardType: CardTypes.Character,
                    cardCondition: card => card.hasStatusTokens && card.isParticipating()
                },
                ring: {
                    mode: TargetModes.Ring,
                    dependsOn: 'character',
                    activePromptTitle: 'Choose an unclaimed ring to move fate to',
                    ringCondition: ring => ring.isUnclaimed(),
                    gameAction: AbilityDsl.actions.placeFateOnRing(context => ({ origin: context.targets.character }))
                }
            }
        });
    }
}

TogashiDreamer.id = 'togashi-dreamer';

module.exports = TogashiDreamer;
