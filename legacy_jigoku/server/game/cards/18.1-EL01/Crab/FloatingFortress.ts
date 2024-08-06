import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class FloatingFortress extends DrawCard {
    static id = 'floating-fortress';

    setupCardAbilities() {
        this.action({
            title: 'Become another holding',
            condition: (context) => context.player.isDefendingPlayer(),
            cost: AbilityDsl.costs.payFate(1),
            target: {
                cardType: CardTypes.Holding,
                controller: Players.Self,
                location: Locations.DynastyDiscardPile,
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.cardLastingEffect((context) => ({
                        target: context.source,
                        effect: AbilityDsl.effects.copyCard(context.target)
                    })),
                    AbilityDsl.actions.chooseAction({
                        activePromptTitle: 'Move the holding to into the attacked provinces?',
                        options: {
                            Yes: {
                                action: AbilityDsl.actions.selectCard((context) => ({
                                    activePromptTitle: 'Choose an attacked province',
                                    hidePromptIfSingleCard: true,
                                    cardType: CardTypes.Province,
                                    location: Locations.Provinces,
                                    message: '{0} moves {1} to {2}',
                                    messageArgs: (province, player) => [player, context.source, province],
                                    cardCondition: (card) => card.isConflictProvince(),
                                    subActionProperties: (card) => ({
                                        target: context.source,
                                        destination: card.location
                                    }),
                                    gameAction: AbilityDsl.actions.moveCard({})
                                }))
                            },
                            No: { action: AbilityDsl.actions.noAction() }
                        }
                    })
                ])
            },
            effect: 'turn {1} into a copy of {0}',
            effectArgs: (context) => [context.source]
        });
    }
}