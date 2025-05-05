import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import type { Player } from '../core/Player';
import type { IViewCardProperties } from './ViewCardSystem';
import { ViewCardInteractMode, ViewCardSystem } from './ViewCardSystem';
import * as Helpers from '../core/utils/Helpers';

export type ILookAtProperties = IViewCardProperties;

export class LookAtSystem<TContext extends AbilityContext = AbilityContext> extends ViewCardSystem<TContext, ILookAtProperties> {
    public override readonly name = 'lookAt';
    public override readonly eventName = EventName.OnLookAtCard;

    protected override defaultProperties: IViewCardProperties = {
        interactMode: ViewCardInteractMode.ViewOnly,
        message: '{0} sees {1}',
        useDisplayPrompt: null
    };

    public override getEffectMessage(context: TContext, additionalProperties?: Partial<ILookAtProperties>): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        let effectArg = 'a card';
        if (Helpers.equalArrays(Helpers.asArray(properties.target), context.player.opponent.hand)) {
            effectArg = 'the opponent’s hand';
        }

        return ['look at {0}', [effectArg]];
    }

    public override getMessageArgs(event: any, context: TContext, additionalProperties: Partial<ILookAtProperties>): any[] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const messageArgs = properties.messageArgs ? properties.messageArgs(event.cards) : [
            this.getPromptedPlayer(properties, context), event.cards
        ];
        return messageArgs;
    }

    protected override getChatMessage(useDisplayPrompt: boolean, context: TContext, additionalProperties: Partial<ILookAtProperties>): string {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (useDisplayPrompt) {
            if (Helpers.equalArrays(Helpers.asArray(properties.target), context.player.opponent.hand)) {
                return '{0} looks at the opponent’s hand';
            }
            return '{0} looks at a card';
        }

        return Helpers.derive(properties.message, context);
    }

    protected override getPromptedPlayer(properties: ILookAtProperties, context: TContext): Player {
        return context.player;
    }

    public override checkEventCondition(): boolean {
        return true;
    }
}
