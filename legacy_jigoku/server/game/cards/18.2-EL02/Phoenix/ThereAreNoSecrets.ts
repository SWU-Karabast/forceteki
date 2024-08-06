import AbilityDsl from '../../../abilitydsl';
import { CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

export default class ThereAreNoSecrets extends DrawCard {
    static id = 'there-are-no-secrets';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Gain 1 fate',
            when: {
                onMoveFate: (event, context) =>
                    context.source.parent && event.origin === context.source.parent && event.fate > 0
            },
            gameAction: AbilityDsl.actions.gainFate((context) => ({ target: context.player }))
        });
    }

    canPlay(context: TriggeredAbilityContext, playType: string) {
        return (
            context.player.cardsInPlay.any(
                (card: DrawCard) => card.getType() === CardTypes.Character && card.hasTrait('shugenja')
            ) && super.canPlay(context, playType)
        );
    }
}