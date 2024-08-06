import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type Ring from '../../../ring';

export default class GreaterUnderstanding extends DrawCard {
    static id = 'greater-understanding-2';

    setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.cardCannot({
                cannot: 'target',
                restricts: 'opponentsCardAbilities',
                applyingPlayer: this.controller
            })
        });

        this.reaction({
            when: {
                onMoveFate: (event, context) => event.recipient === context.source.parent,
                onPlaceFateOnUnclaimedRings: (event, context) => context.source.parent.isUnclaimed()
            },
            title: "Resolve the attached ring's effect",
            gameAction: AbilityDsl.actions.resolveRingEffect((context) => ({ target: context.source.parent })),
            then: (context) => ({
                gameAction: AbilityDsl.actions.selectRing({
                    activePromptTitle: 'Choose a ring to attach Greater Understanding',
                    player: Players.Opponent,
                    ringCondition: (ring) => ring !== context.source.parent && ring.getFate() === 0,
                    subActionProperties: (ring) => ({ attachment: context.source, target: ring }),
                    gameAction: AbilityDsl.actions.attachToRing(),
                    message: '{0} moves {1} to {2} - enlightenment is elusive',
                    messageArgs: (ring, player) => [player, context.source, ring]
                })
            })
        });
    }

    canAttach(ring: BaseCard | Ring) {
        return ring?.type === 'ring';
    }

    canPlayOn(source: any) {
        return source && source.getType() === 'ring' && this.getType() === CardTypes.Attachment;
    }

    mustAttachToRing() {
        return true;
    }
}
