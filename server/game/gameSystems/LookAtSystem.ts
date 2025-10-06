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
        let effectArgs: any[] = ['a card'];

        let format = 'look at {0}';
        const cardsFormat: FormatMessage = { format: ChatHelpers.formatWithLength(Helpers.asArray(properties.target).length, ''), args: this.getTargetMessage(properties.target, context) };

        if (Helpers.equalArrays(Helpers.asArray(properties.target), context.player.opponent.hand)) {
            const handSize = Helpers.asArray(properties.target).length;
            format = 'look at the opponent\'s hand and sees ' + ChatHelpers.formatWithLength(handSize, '');
            effectArgs = this.getTargetMessage(properties.target, context);
        } else if (Helpers.asArray(properties.target)
            .every((card) => card.zone.owner === context.player.opponent && card.zoneName === ZoneName.Resource)
        ) {
            const targetCount = Helpers.asArray(properties.target).length;
            format = targetCount === 1
                ? 'look at an enemy resource and sees'
                : `look at ${targetCount} enemy resources and sees`;
            format += ' ' + ChatHelpers.formatWithLength(targetCount, '');
            effectArgs = this.getTargetMessage(properties.target, context);
        }

        return [format, effectArgs];
    }

    protected override getPromptedPlayer(properties: ILookAtProperties, context: TContext): Player {
        return context.player;
    }

    public override checkEventCondition(): boolean {
        return true;
    }
}
