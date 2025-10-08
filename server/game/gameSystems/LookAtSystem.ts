import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, ZoneName } from '../core/Constants';
import type { Player } from '../core/Player';
import type { IViewCardProperties } from './ViewCardSystem';
import { ViewCardInteractMode, ViewCardSystem } from './ViewCardSystem';
import * as Helpers from '../core/utils/Helpers';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import type { FormatMessage } from '../core/chat/GameChat';

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
        const targetCount = Helpers.asArray(properties.target).length;
        let effectArg: string | FormatMessage = ChatHelpers.pluralize(targetCount, 'a card', targetCount + ' cards');

        if (Helpers.equalArrays(Helpers.asArray(properties.target), context.player.opponent.hand)) {
            effectArg = {
                format: 'the opponent\'s hand and sees {0}',
                args: [this.getTargetMessage(properties.target, context)]
            };
        } else if (Helpers.asArray(properties.target)
            .every((card) => card.zone.owner === context.player.opponent && card.zoneName === ZoneName.Resource)
        ) {
            effectArg = {
                format: '{0} and sees {1}',
                args: [
                    ChatHelpers.pluralize(targetCount, 'an enemy resource', 'enemy resources'),
                    this.getTargetMessage(properties.target, context),
                ],
            };
        }

        return ['look at {0}', [effectArg]];
    }

    protected override getPromptedPlayer(properties: ILookAtProperties, context: TContext): Player {
        return context.player;
    }

    public override checkEventCondition(): boolean {
        return true;
    }
}
