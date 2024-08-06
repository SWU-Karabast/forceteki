import { Locations, CardTypes, Players } from '../../Constants';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class AsahinaTakako extends DrawCard {
    static id = 'asahina-takako';

    setupCardAbilities() {
        this.persistentEffect({
            targetLocation: Locations.Provinces,
            match: (card) => card.isDynasty && card.isFacedown(),
            effect: AbilityDsl.effects.canBeSeenWhenFacedown()
        });

        this.action({
            title: 'Discard a card or switch with another card',
            target: {
                cardType: [CardTypes.Character, CardTypes.Holding, CardTypes.Event],
                location: Locations.Provinces,
                controller: Players.Self,
                gameAction: AbilityDsl.actions.chooseAction((context) => ({
                    options: {
                        Discard: {
                            action: AbilityDsl.actions.discardCard({ target: context.target })
                        },
                        'Switch with another card': {
                            action: AbilityDsl.actions.selectCard({
                                activePromptTitle: 'Choose a card to switch with',
                                cardType: [CardTypes.Character, CardTypes.Holding, CardTypes.Event],
                                location: Locations.Provinces,
                                controller: Players.Self,
                                message: '{0} switches {1} in {2} and {3} in {4}',
                                messageArgs: (card) => [
                                    context.player,
                                    context.target.isFacedown() ? 'a facedown card' : context.target,
                                    context.target.location,
                                    card.isFacedown() ? 'a facedown card' : card,
                                    card.location
                                ],
                                gameAction: AbilityDsl.actions.moveCard({
                                    destination: context.target.location,
                                    switch: true,
                                    switchTarget: context.target
                                })
                            }),
                            message: '{0} chooses to discard {1}'
                        }
                    }
                }))
            },
            effect: 'switch or discard {1} in {2}',
            effectArgs: (context) => [
                context.target.isFacedown() ? 'a facedown card' : context.target,
                context.target.location
            ]
        });
    }
}
