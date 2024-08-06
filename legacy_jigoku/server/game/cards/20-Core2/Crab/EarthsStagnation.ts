import { CardTypes } from '../../../Constants';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { AbilityContext } from '../../../AbilityContext';

function penaltyAmount(context: AbilityContext): number {
    return context.player.hasAffinity('earth', context) ? -2 : -1;
}

export default class EarthsStagnation extends DrawCard {
    static id = 'earth-s-stagnation';

    public setupCardAbilities() {
        this.forcedReaction({
            title: 'Give attached character a skill penalty',
            when: {
                onCardPlayed: (event, context) =>
                    context.source.parent &&
                    (event.card as DrawCard).type === CardTypes.Event &&
                    context.source.parent.isParticipating()
            },
            gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                target: context.source.parent,
                effect: AbilityDsl.effects.modifyBothSkills(penaltyAmount(context))
            })),
            effect: 'give {1}{2} and {3}{4} to {5}',
            effectArgs: (context) => {
                const penalty = penaltyAmount(context);
                return [penalty, 'military', penalty, 'political', context.source.parent];
            },
            limit: AbilityDsl.limit.unlimitedPerConflict()
        });
    }

    public canPlay(context: TriggeredAbilityContext, playType: string) {
        return (
            context.player.cardsInPlay.any(
                (card: DrawCard) => card.getType() === CardTypes.Character && card.hasTrait('shugenja')
            ) && super.canPlay(context, playType)
        );
    }
}