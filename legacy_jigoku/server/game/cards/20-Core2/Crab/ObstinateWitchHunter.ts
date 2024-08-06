import { CardTypes, Durations, Locations, Phases } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import BaseCard from '../../../basecard';
import DrawCard from '../../../drawcard';

export default class ObstinateWitchHunter extends DrawCard {
    static id = 'obstinate-witch-hunter';

    public setupCardAbilities() {
        this.forcedReaction({
            title: "Can't be discarded or remove fate",
            when: {
                onPhaseStarted: (event, context) =>
                    event.phase === Phases.Fate &&
                    context.game.allCards.some(
                        (card: BaseCard) =>
                            card instanceof DrawCard &&
                            card.type === CardTypes.Character &&
                            card.location === Locations.PlayArea &&
                            card.isFaceup() &&
                            card !== context.source &&
                            (card.isTainted || card.hasTrait('shadowlands'))
                    )
            },
            effect: 'stop him being discarded or losing fate in this phase',
            gameAction: AbilityDsl.actions.cardLastingEffect({
                duration: Durations.UntilEndOfPhase,
                effect: [AbilityDsl.effects.cardCannot('removeFate'), AbilityDsl.effects.cardCannot('discardFromPlay')]
            })
        });
    }
}
