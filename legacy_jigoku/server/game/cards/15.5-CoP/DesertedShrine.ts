import { TargetModes } from '../../Constants';
import type { CardGameAction } from '../../GameActions/CardGameAction';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class DesertedShrine extends ProvinceCard {
    static id = 'deserted-shrine';

    setupCardAbilities() {
        this.reaction({
            title: 'Discard the top 10 cards of a deck',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            target: {
                mode: TargetModes.Select,
                targets: true,
                activePromptTitle: 'Choose a deck',
                choices: (context) => {
                    const choices: [string, CardGameAction][] = [];
                    if (context.player.dynastyDeck.size() > 0) {
                        choices.push([
                            `${context.player.name}'s Dynasty`,
                            AbilityDsl.actions.discardCard((context) => ({
                                target: context.player.dynastyDeck.first(10)
                            }))
                        ]);
                    }
                    if (context.player.conflictDeck.size() > 0) {
                        choices.push([
                            `${context.player.name}'s Conflict`,
                            AbilityDsl.actions.discardCard((context) => ({
                                target: context.player.conflictDeck.first(10)
                            }))
                        ]);
                    }
                    if (context.player.opponent?.dynastyDeck.size() > 0) {
                        choices.push([
                            `${context.player.opponent.name}'s Dynasty`,
                            AbilityDsl.actions.discardCard((context) => ({
                                target: context.player.opponent.dynastyDeck.first(10)
                            }))
                        ]);
                    }
                    if (context.player.opponent?.conflictDeck.size() > 0) {
                        choices.push([
                            `${context.player.opponent.name}'s Conflict`,
                            AbilityDsl.actions.discardCard((context) => ({
                                target: context.player.opponent.conflictDeck.first(10)
                            }))
                        ]);
                    }

                    return Object.fromEntries(choices);
                }
            },
            effect: 'discard the top 10 cards of {1} deck',
            effectArgs: (context) => [context.select]
        });
    }
}
