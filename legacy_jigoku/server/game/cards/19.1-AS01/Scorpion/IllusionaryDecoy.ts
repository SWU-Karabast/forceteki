import { CardTypes, Locations, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import DrawCard from '../../../drawcard';
import type Ring from '../../../ring';

export default class IllusionaryDecoy extends DrawCard {
    static id = 'illusionary-decoy';

    public setupCardAbilities() {
        this.reaction({
            title: 'Put into play',
            location: Locations.Hand,
            when: {
                onConflictStarted: (event, context) =>
                    context.player.anyCardsInPlay((card: BaseCard) => card.hasTrait('shugenja'))
            },
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.putIntoConflict((context) => ({ target: context.source })),
                AbilityDsl.actions.chooseAction({
                    options: {
                        'Move another of your characters home': {
                            action: AbilityDsl.actions.selectCard((context) => ({
                                controller: Players.Self,
                                cardType: CardTypes.Character,
                                cardCondition: (card) => card.isParticipating(),
                                message: '{0} moves home {1} - they were an {2}!',
                                messageArgs: (card, player) => [player, card, context.source],
                                gameAction: AbilityDsl.actions.sendHome()
                            }))
                        },
                        Done: { action: AbilityDsl.actions.noAction() }
                    }
                })
            ]),
            effect: 'put {0} into play in the conflict',
            max: AbilityDsl.limit.perConflict(1)
        });

        this.action({
            title: 'Return to hand',
            condition: (context) => {
                const claimedRings: Ring[] = context.source.controller.getClaimedRings();
                const matchShugenjaElementWithClaimedRing = (context.source.controller.cardsInPlay as BaseCard[]).some(
                    (card) =>
                        card.getType() === CardTypes.Character &&
                        card.hasTrait('shugenja') &&
                        claimedRings.some((ring) =>
                            ring.getElements().some((element: string) => card.hasTrait(element))
                        )
                );
                return matchShugenjaElementWithClaimedRing;
            },
            gameAction: AbilityDsl.actions.returnToHand()
        });
    }
}
