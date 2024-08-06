import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { CardTypes, ConflictTypes, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

export default class CornerThePrey extends DrawCard {
    static id = 'corner-the-prey';

    public setupCardAbilities() {
        this.action({
            title: 'Sacrifice followers to kill',
            condition: (context) => context.game.isDuringConflict(ConflictTypes.Military),
            cost: AbilityDsl.costs.sacrifice({
                cardType: [CardTypes.Character, CardTypes.Attachment],
                mode: TargetModes.Unlimited,
                cardCondition: (card) =>
                    card.hasTrait('follower') &&
                    (card.isParticipating() || (card.parent && card.parent.isParticipating()))
            }),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card, context) =>
                    card.isParticipating() && card.printedCost <= this.getFollowerCount(context),
                gameAction: AbilityDsl.actions.discardFromPlay()
            },
            cannotTargetFirst: true
        });
    }

    private getFollowerCount(context: AbilityContext): number {
        if (context.costs.sacrifice) {
            return context.costs.sacrifice.length;
        }
        const myFollowers = (context.game.allCards as BaseCard[]).filter(
            (card) => card.controller === context.player && card.hasTrait('follower')
        );
        const myParticipatingFollowers = myFollowers.filter(
            (card) => card.isParticipating() || (card.parent && card.parent.isParticipating())
        );
        const amount = myParticipatingFollowers.length;
        return amount;
    }
}
