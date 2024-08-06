import { AbilityContext } from '../AbilityContext';
import { CardTypes } from '../Constants';
import BaseAbility = require('../baseability');
import DrawCard = require('../drawcard');

export class FireRingEffect extends BaseAbility {
    public title = 'Fire Ring Effect';
    public cannotTargetFirst = true;
    public defaultPriority = 4; // Default resolution priority when players have ordering switched off

    constructor(
        private optional: boolean,
        private onResolution = (resolved: boolean) => {}
    ) {
        super({
            target: {
                activePromptTitle: 'Choose character to honor or dishonor',
                cardType: CardTypes.Character,
                cardCondition: <C extends DrawCard>(card: C, context: AbilityContext) =>
                    card.allowGameAction('honor', context) || card.allowGameAction('dishonor', context),
                buttons: optional ? [{ text: "Don't resolve", arg: 'dontResolve' }] : []
            }
        });
    }

    public executeHandler(context: AbilityContext) {
        if (!context.target) {
            context.game.addMessage('{0} chooses not to resolve the {1} ring', context.player, 'fire');
            this.onResolution(false);
            return;
        }

        const choices: string[] = [];
        const handlers: Array<() => void> = [];

        if (context.target.allowGameAction('honor', context)) {
            choices.push(`Honor ${context.target.name}`);
            handlers.push(() => {
                context.game.addMessage(
                    '{0} resolves the {1} ring, honoring {2}',
                    context.player,
                    'fire',
                    context.target
                );
                this.onResolution(true);
                context.game.applyGameAction(context, { honor: context.target });
            });
        }

        if (context.target.allowGameAction('dishonor', context)) {
            choices.push(`Dishonor ${context.target.name}`);
            handlers.push(() => {
                context.game.addMessage(
                    '{0} resolves the {1} ring, dishonoring {2}',
                    context.player,
                    'fire',
                    context.target
                );
                this.onResolution(true);
                context.game.applyGameAction(context, { dishonor: context.target });
            });
        }

        choices.push('Back');
        handlers.push(() => context.player.resolveRingEffects(['fire'], this.optional));

        if (this.optional) {
            choices.push("Don't resolve the fire ring");
            handlers.push(() => {
                context.game.addMessage('{0} chooses not to resolve the {1} ring', context.player, 'fire');
                this.onResolution(false);
            });
        }

        context.game.promptWithHandlerMenu(context.player, {
            choices: choices,
            handlers: handlers,
            source: 'Fire Ring'
        });
    }
}