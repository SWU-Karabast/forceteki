import { TargetModes } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import type { AbilityContext } from '../../../AbilityContext';

function cardDifference(context: AbilityContext): number {
    return Math.max(0, Math.min(5, context.player.opponent.hand.size() - context.player.hand.size()));
}

export default class GladeOfContemplation extends ProvinceCard {
    static id = 'glade-of-contemplation';

    public setupCardAbilities() {
        this.reaction({
            title: 'Draw cards or force the opponent to discard cards',
            when: {
                onConflictDeclared: (event, context) =>
                    event.conflict.declaredProvince === context.source &&
                    context.player.opponent &&
                    context.player.hand.size() < context.player.opponent.hand.size()
            },
            target: {
                mode: TargetModes.Select,
                choices: {
                    'Draw cards': AbilityDsl.actions.draw((context) => ({
                        amount: cardDifference(context)
                    })),
                    'Force opponent to discard cards': AbilityDsl.actions.chosenDiscard((context) => ({
                        amount: cardDifference(context),
                        target: context.player.opponent
                    }))
                }
            },
            effect: '{1}',
            effectArgs: (context) => context.select.toLowerCase()
        });
    }
}