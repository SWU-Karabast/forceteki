import AbilityDsl from '../../../abilitydsl';
import type { Conflict } from '../../../conflict';
import { CardTypes, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type Player from '../../../player';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

const controlledBy = (player: Player) => (character: DrawCard) => character.controller === player;

const trigger = {
    onConflictDeclared: {
        when: (event: Conflict, context: TriggeredAbilityContext) => event.attackers.some(controlledBy(context.player)),
        cardCondition: (card: DrawCard, context: TriggeredAbilityContext) => context.event.attackers.includes(card)
    },
    onDefendersDeclared: {
        when: (event: Conflict, context: TriggeredAbilityContext) => event.defenders.some(controlledBy(context.player)),
        cardCondition: (card: DrawCard, context: TriggeredAbilityContext) => context.event.defenders.includes(card)
    },
    onMoveToConflict: {
        when: (event: any, context: TriggeredAbilityContext) => controlledBy(context.player)(event.card),
        cardCondition: (card: DrawCard, context: TriggeredAbilityContext) => context.event.card === card
    }
};

export default class SanctifiedEarth extends DrawCard {
    static id = 'sanctified-earth';

    public setupCardAbilities() {
        this.attachmentConditions({ trait: 'shugenja', myControl: true });

        this.reaction({
            title: 'Give character a skill bonus',
            when: {
                onConflictDeclared: trigger.onConflictDeclared.when,
                onDefendersDeclared: trigger.onDefendersDeclared.when,
                onMoveToConflict: trigger.onMoveToConflict.when
            },
            target: {
                cardType: CardTypes.Character,
                player: Players.Self,
                cardCondition: (card, context) => trigger[context.event.name]?.cardCondition(card, context) ?? false,
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.cardLastingEffect({
                        effect: AbilityDsl.effects.modifyBothSkills(2)
                    }),

                    AbilityDsl.actions.onAffinity({
                        trait: 'earth',
                        effect: "make {0} invulnerable to opponent's send home",
                        effectArgs: (context) => [context.target],
                        gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                            target: context.target,
                            effect: AbilityDsl.effects.cardCannot({
                                cannot: 'sendHome',
                                restricts: 'opponentsCardEffects'
                            })
                        }))
                    })
                ])
            },
            effect: 'give +2{1} and +2{2} to {3}',
            effectArgs: (context) => ['military', 'political', context.target]
        });
    }
}