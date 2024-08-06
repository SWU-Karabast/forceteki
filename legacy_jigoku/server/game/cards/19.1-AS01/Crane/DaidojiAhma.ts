import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { Locations } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

export default class DaidojiAhma extends DrawCard {
    static id = 'daidoji-ahma';

    public setupCardAbilities() {
        this.wouldInterrupt({
            title: 'Cancel ability',
            when: {
                onInitiateAbilityEffects: (event, context) =>
                    event.context.ability.isTriggeredAbility() &&
                    (event.cardTargets as Array<BaseCard>).some((card) => this.targetIsDishonoredCrane(card, context)),
                onMoveFate: (event, context) =>
                    this.isRingEffect(event) && event.fate > 0 && this.targetIsDishonoredCrane(event.origin, context),
                onCardHonored: (event, context) =>
                    this.isRingEffect(event) && this.targetIsDishonoredCrane(event.card, context),
                onCardDishonored: (event, context) =>
                    this.isRingEffect(event) && this.targetIsDishonoredCrane(event.card, context),
                onCardBowed: (event, context) =>
                    this.isRingEffect(event) && this.targetIsDishonoredCrane(event.card, context),
                onCardReadied: (event, context) =>
                    this.isRingEffect(event) && this.targetIsDishonoredCrane(event.card, context)
            },
            gameAction: AbilityDsl.actions.cancel(),
            effect: 'cancel the effects of {1}{2}',
            effectArgs: (context) => [
                context.event.context.source.type === 'ring' ? 'the ' : '',
                context.event.context.source
            ]
        });
    }

    private isRingEffect(event: any): boolean {
        return event.context.source.type === 'ring';
    }

    private targetIsDishonoredCrane(card: BaseCard, context: TriggeredAbilityContext<this>): boolean {
        return (
            card.isDishonored &&
            card.controller === context.player &&
            card.location === Locations.PlayArea &&
            card.isFaction('crane')
        );
    }
}