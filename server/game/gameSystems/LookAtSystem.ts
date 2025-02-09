import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import type Player from '../core/Player';
import type { IViewCardProperties } from './ViewCardSystem';
import { ViewCardInteractMode, ViewCardSystem } from './ViewCardSystem';


export type ILookAtProperties = IViewCardProperties;

export class LookAtSystem<TContext extends AbilityContext = AbilityContext> extends ViewCardSystem<TContext, ILookAtProperties> {
    public override readonly name = 'lookAt';
    public override readonly eventName = EventName.OnLookAtCard;
    public override readonly effectDescription = 'look at a card';

    protected override defaultProperties: IViewCardProperties = {
        interactMode: ViewCardInteractMode.ViewOnly,
        message: '{0} sees {1}',
        useDisplayPrompt: false
    };

    public override getMessageArgs(event: any, context: TContext, additionalProperties: any): any[] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const messageArgs = properties.messageArgs ? properties.messageArgs(event.cards) : [
            context.source, event.cards
        ];
        return messageArgs;
    }

    protected override getChatMessage(properties: IViewCardProperties): string {
        return properties.useDisplayPrompt ? '{0} looks at a card' : '{0} sees {1}';
    }

    protected override getPromptedPlayer(properties: ILookAtProperties, context: TContext): Player {
        if (!properties.useDisplayPrompt) {
            return null;
        }

        return context.player;
    }

    public override checkEventCondition(): boolean {
        return true;
    }
}
