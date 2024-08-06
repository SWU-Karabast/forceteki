import AbilityDsl = require('../../abilitydsl');
import DrawCard = require('../../drawcard');

export default class KitsukiYuikimi extends DrawCard {
    static id = 'kitsuki-yuikimi';

    public setupCardAbilities() {
        this.reaction({
            title: "Cannot be targeted by opponent's triggered abilities",
            when: {
                onMoveFate: (event, context) =>
                    context.source.isParticipating() &&
                    event.origin &&
                    event.origin.type === 'ring' &&
                    context.player.opponent !== undefined
            },
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                effect: AbilityDsl.effects.cardCannot({
                    cannot: 'target',
                    restricts: 'opponentsTriggeredAbilities',
                    applyingPlayer: context.player
                })
            })),
            effect: "prevent {0} from being chosen as the target of {1}'s triggered abilities until the end of the conflict",
            effectArgs: (context) => [context.player.opponent]
        });
    }
}
