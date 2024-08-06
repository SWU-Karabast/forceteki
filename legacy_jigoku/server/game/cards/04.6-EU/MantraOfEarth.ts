import { CardTypes } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class MantraOfEarth extends DrawCard {
    static id = 'mantra-of-earth';

    setupCardAbilities() {
        this.reaction({
            title: "Make a monk untargetable by opponents' card effects and draw a card",
            when: {
                onConflictDeclared: (event, context) =>
                    event.ring.hasElement('earth') && event.conflict.attackingPlayer === context.player.opponent
            },
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) =>
                    card.hasTrait('monk') || card.attachments.some((card) => card.hasTrait('monk')),
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    effect: AbilityDsl.effects.cardCannot({
                        cannot: 'target',
                        restricts: 'opponentsCardEffects',
                        applyingPlayer: context.player
                    })
                }))
            },
            effect: "make {0} untargetable by opponents' card effects and draw a card",
            gameAction: AbilityDsl.actions.draw()
        });
    }
}
