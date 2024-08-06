import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class CounselFromYumeDo extends DrawCard {
    static id = 'counsel-from-yume-do';

    public setupCardAbilities() {
        this.action({
            title: 'Shuffle cards back into your deck',
            condition: (context) =>
                (context.player.cardsInPlay as Array<DrawCard>).some(
                    (card) => card.getType() === CardTypes.Character && card.hasTrait('shugenja')
                ),
            target: {
                mode: TargetModes.UpTo,
                activePromptTitle: 'Choose up to 3 conflict cards',
                numCards: 3,
                location: Locations.ConflictDiscardPile,
                cardType: [CardTypes.Character, CardTypes.Attachment, CardTypes.Event],
                controller: Players.Self,
                gameAction: AbilityDsl.actions.returnToDeck({ location: Locations.ConflictDiscardPile, shuffle: true })
            },
            then: (context) => ({
                gameAction: AbilityDsl.actions.onAffinity({
                    trait: 'water',
                    effect: 'draw a card',
                    gameAction: AbilityDsl.actions.draw({
                        target: context.player
                    })
                })
            })
        });
    }
}
