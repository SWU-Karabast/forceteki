import { CardTypes, Players } from '../../Constants';
import { PlayAttachmentAction } from '../../PlayAttachmentAction';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';
import type DrawCard from '../../drawcard';

export default class IronMountainCastle extends StrongholdCard {
    static id = 'iron-mountain-castle';

    setupCardAbilities() {
        this.persistentEffect({
            match: (card) => card.isFaction('dragon'),
            targetController: Players.Self,
            effect: AbilityDsl.effects.modifyRestrictedAttachmentAmount(1)
        });

        this.interrupt({
            title: 'Reduce cost of next attachment',
            when: {
                onAbilityResolverInitiated: (event, context) => {
                    //might be able to remove the source.type check at some point
                    const isAttachment =
                        event.context.source.type === CardTypes.Attachment ||
                        event.context.ability instanceof PlayAttachmentAction;
                    return (
                        isAttachment &&
                        event.context.player === context.player &&
                        event.context.target &&
                        event.context.target.controller === context.player &&
                        event.context.target.type === CardTypes.Character &&
                        event.context.ability.getReducedCost(event.context) > 0
                    );
                }
            },
            cost: AbilityDsl.costs.bowSelf(),
            effect: 'reduce the cost of their next attachment by 1',
            gameAction: AbilityDsl.actions.playerLastingEffect((context) => ({
                targetController: context.player,
                effect: AbilityDsl.effects.reduceNextPlayedCardCost(
                    1,
                    // @ts-ignore
                    (card: DrawCard) => card === context.event.context.source
                )
            }))
        });
    }
}
