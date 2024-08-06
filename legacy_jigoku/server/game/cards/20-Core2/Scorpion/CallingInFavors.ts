import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class CallingInFavors extends DrawCard {
    static id = 'calling-in-favors';

    setupCardAbilities() {
        this.action({
            title: 'Take control of an attachment',
            cost: AbilityDsl.costs.dishonor(),
            target: {
                cardType: CardTypes.Attachment,
                controller: Players.Opponent
            },
            gameAction: AbilityDsl.actions.ifAble((context) => ({
                ifAbleAction: AbilityDsl.actions.attach({
                    target: context.costs.dishonor,
                    attachment: context.target,
                    takeControl: true
                }),
                otherwiseAction: AbilityDsl.actions.discardFromPlay({ target: context.target })
            }))
        });
    }
}
