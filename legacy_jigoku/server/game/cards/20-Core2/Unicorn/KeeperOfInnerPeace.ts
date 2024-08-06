import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { CardTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import Ring from '../../../ring';

export default class KeeperOfInnerPeace extends DrawCard {
    static id = 'keeper-of-inner-peace';

    setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Protect the fate of a character',
            when: {
                onMoveFate: (event, context) =>
                    !context.source.bowed &&
                    event.context.source.name !== 'Framework effect' &&
                    event.fate > 0 &&
                    event.origin?.type === CardTypes.Character &&
                    event.origin?.controller === context.player
            },
            gameAction: AbilityDsl.actions.cancel(),
            effect: "protect {1}'s fate from {2}{3}",
            effectArgs: (context) => [
                context.event.origin,
                context.event.context.source instanceof Ring || (context.event.context.source as BaseCard).isUnique()
                    ? 'the '
                    : '',
                context.event.context.source
            ]
        });
    }
}
