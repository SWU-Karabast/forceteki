import { CardTypes, Locations, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import { AbilityContext } from '../../../AbilityContext';

function attachedToType(context: AbilityContext): CardTypes {
    return (context.target.parent as DrawCard).type;
}

export default class WiseQuartermaster extends DrawCard {
    static id = 'wise-quartermaster';

    setupCardAbilities() {
        this.action({
            title: 'Move an attachment',
            condition: (context) => !context.game.isDuringConflict(),
            target: {
                cardType: CardTypes.Attachment,
                controller: Players.Self,
                cardCondition: (attachment, context) => attachment.parent.controller === context.player,
                gameAction: AbilityDsl.actions.selectCard((context) => {
                    const { location, cardType } =
                        attachedToType(context) === CardTypes.Province
                            ? { location: [Locations.Provinces], cardType: CardTypes.Province }
                            : { location: [Locations.PlayArea], cardType: CardTypes.Character };
                    return {
                        location,
                        cardType,
                        controller: Players.Self,
                        cardCondition: (card, context) =>
                            card !== context.target.parent && card.controller === context.player,
                        message: '{0} moves {1} to {2}',
                        messageArgs: (card) => [context.player, context.target, card],
                        gameAction: AbilityDsl.actions.attach({ attachment: context.target })
                    };
                })
            },
            effect: 'move {0} to another {1}',
            effectArgs: (context) => [attachedToType(context) === CardTypes.Province ? 'province' : 'character']
        });
    }
}