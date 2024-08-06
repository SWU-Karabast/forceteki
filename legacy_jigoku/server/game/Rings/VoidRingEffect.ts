import { AbilityContext } from '../AbilityContext';
import { CardTypes } from '../Constants';
import BaseAbility = require('../baseability');
import DrawCard = require('../drawcard');

export class VoidRingEffect extends BaseAbility {
    public title = 'Void Ring Effect';
    public cannotTargetFirst = true;
    public defaultPriority = 2; // Default resolution priority when players have ordering switched off

    constructor(
        optional: boolean,
        private onResolution = (resolved: boolean) => {}
    ) {
        super({
            target: {
                activePromptTitle: 'Choose character to remove fate from',
                source: 'Void Ring',
                buttons: optional ? [{ text: "Don't resolve", arg: 'dontResolve' }] : [],
                cardType: CardTypes.Character,

                cardCondition: <C extends DrawCard>(card: C, context: AbilityContext) =>
                    card.allowGameAction('removeFate', context)
            }
        });
    }

    public executeHandler(context: AbilityContext): void {
        if (context.target) {
            context.game.addMessage(
                '{0} resolves the {1} ring, removing a fate from {2}',
                context.player,
                'void',
                context.target
            );
            this.onResolution(true);
            context.game.applyGameAction(context, { removeFate: context.target });
        } else {
            context.game.addMessage('{0} chooses not to resolve the {1} ring', context.player, 'void');
            this.onResolution(false);
        }
    }
}