import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';
import type { TriggeredAbilityContext } from '../../TriggeredAbilityContext';

export default class AgashaSumiko2 extends DrawCard {
    static id = 'agasha-sumiko-2';

    public setupCardAbilities() {
        this.interrupt({
            title: 'Honor a character',
            when: {
                onCardLeavesPlay: (event, context) =>
                    event.card === context.source && context.player.opponent !== undefined
            },
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.loseHonor((context) => ({
                    target: context.player.opponent,
                    amount: context.player.opponent.isMoreHonorable() ? 2 : 0
                })),
                AbilityDsl.actions.loseFate((context) => ({
                    target: context.player.opponent,
                    amount: context.player.opponent.fate > context.player.fate ? 2 : 0
                })),
                AbilityDsl.actions.chosenDiscard((context) => ({
                    target: context.player.opponent,
                    amount: context.player.opponent.hand.size() > context.player.hand.size() ? 2 : 0
                }))
            ]),
            effect: 'make {1} {2}',
            effectArgs: (context) => [context.player.opponent, this.getChatMessage(context)]
        });
    }

    private getChatMessage(context: TriggeredAbilityContext) {
        let messages: string[] = [];
        if (context.player.opponent) {
            if (context.player.opponent.honor > context.player.honor) {
                messages.push('lose 2 honor');
            }
            if (context.player.opponent.fate > context.player.fate) {
                messages.push('lose 2 fate');
            }
            if (context.player.opponent.hand.size() > context.player.hand.size()) {
                messages.push('disard 2 cards');
            }

            if (messages.length === 3) {
                return `${messages[0]}, ${messages[1]} and ${messages[2]}`;
            }
            if (messages.length === 2) {
                return `${messages[0]} and ${messages[1]}`;
            }
            if (messages.length === 1) {
                return `${messages[0]}`;
            }
        }

        return '';
    }
}