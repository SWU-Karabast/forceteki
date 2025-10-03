import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, ZoneName } from '../core/Constants';
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
        } else if (Helpers.asArray(properties.target)
            .every((card) => card.zone.owner === context.player.opponent && card.zoneName === ZoneName.Resource)
        ) {
            const targetCount = Helpers.asArray(properties.target).length;
            effectArg = targetCount === 1
                ? 'an enemy resource'
                : `${targetCount} enemy resources`;
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
