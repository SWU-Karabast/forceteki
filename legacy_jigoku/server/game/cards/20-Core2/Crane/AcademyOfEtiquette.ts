import { TargetModes, Players, Locations, Phases, CardTypes, Durations } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class AcademyOfEtiquette extends DrawCard {
    static id = 'academy-of-etiquette';

    setupCardAbilities() {
        this.reaction({
            title: 'Give characters courtesy',
            when: {
                onPhaseStarted: (event) => event.phase === Phases.Fate
            },
            target: {
                mode: TargetModes.UpTo,
                numCards: 2,
                activePromptTitle: 'Choose up to 2 cards',
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isHonored,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.cardLastingEffect(() => ({
                    effect: AbilityDsl.effects.addKeyword('courtesy'),
                    duration: Durations.UntilEndOfPhase
                }))
            },
            effect: 'give {0} courtesy'
        });

        this.reaction({
            title: 'Place a card in this province',
            when: {
                onPhaseStarted: (event) => event.phase === Phases.Dynasty
            },
            gameAction: AbilityDsl.actions.handler({
                handler: (context) => {
                    const province = context.source.location;
                    this.game.queueSimpleStep(() => context.player.putTopDynastyCardInProvince(province));
                }
            }),
            effect: 'place {1} faceup in {2}',
            effectArgs: (context) => [
                context.player.dynastyDeck.first() ? context.player.dynastyDeck.first() : 'a card',
                context.player.getProvinceCardInProvince(context.source.location).isFacedown()
                    ? context.source.location
                    : context.player.getProvinceCardInProvince(context.source.location)
            ]
        });
    }
}
