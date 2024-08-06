import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Durations } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

export default class LongJourneyHome extends DrawCard {
    static id = 'long-journey-home';

    setupCardAbilities() {
        this.reaction({
            title: 'Bow a character for the phase',
            when: {
                onSendHome: (event, context) => this.affectedOpponentsCharacter(event, context),
                onReturnHome: (event, context) => this.affectedOpponentsCharacter(event, context)
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) => card === context.event.card,
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.bow(),
                    AbilityDsl.actions.cardLastingEffect({
                        duration: Durations.UntilEndOfPhase,
                        effect: AbilityDsl.effects.cardCannot({ cannot: 'ready' })
                    })
                ])
            },
            effect: 'make {1} take the long way home. {1} is bowed and cannot ready until the end of the phase',
            effectArgs: (context) => [context.event.card]
        });
    }

    private affectedOpponentsCharacter(event: any, context: TriggeredAbilityContext<this>) {
        return event.card.type === CardTypes.Character && event.card.controller === context.source.controller.opponent;
    }
}