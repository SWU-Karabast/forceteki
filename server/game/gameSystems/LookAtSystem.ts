import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import { IViewCardProperties, ViewCardMode, ViewCardSystem } from './ViewCardSystem';

export type ILookAtProperties = Omit<IViewCardProperties, 'viewType'>;

export class LookAtSystem<TContext extends AbilityContext = AbilityContext> extends ViewCardSystem<TContext> {
    public override readonly name = 'lookAt';
    public override readonly eventName = EventName.OnLookAtCard;
    public override readonly effectDescription = 'look at a card';

    protected override defaultProperties: IViewCardProperties = {
        sendChatMessage: true,
        message: '{0} sees {1}',
        viewType: ViewCardMode.LookAt
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: ILookAtProperties | ((context?: AbilityContext) => ILookAtProperties)) {
        const propsWithViewType = GameSystem.appendToPropertiesOrPropertyFactory<IViewCardProperties, 'viewType'>(propertiesOrPropertyFactory, { viewType: ViewCardMode.LookAt });
        super(propsWithViewType);
    }

    // TODO: we need a 'look at' prompt for secretly revealing, currently chat logs go to all players
    public override getMessageArgs(event: any, context: TContext, additionalProperties: any): any[] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const messageArgs = properties.messageArgs ? properties.messageArgs(event.cards) : [
            context.source, event.cards
        ];
        return messageArgs;
    }

    public override checkEventCondition(): boolean {
        return true;
    }
}
