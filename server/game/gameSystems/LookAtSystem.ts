import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import { ViewCardSystem, IViewCardProperties, ViewCardMode } from './ViewCardSystem';

export type ILookAtProperties = Omit<IViewCardProperties, 'viewType'>;

export class LookAtSystem extends ViewCardSystem {
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
        let propertyWithViewType: IViewCardProperties | ((context?: AbilityContext) => IViewCardProperties);

        if (typeof propertiesOrPropertyFactory === 'function') {
            propertyWithViewType = (context?: AbilityContext) => Object.assign(propertiesOrPropertyFactory(context), { viewType: ViewCardMode.LookAt });
        } else {
            propertyWithViewType = Object.assign(propertiesOrPropertyFactory, { viewType: ViewCardMode.LookAt });
        }

        super(propertyWithViewType);
    }

    public override getMessageArgs(event: any, context: AbilityContext, additionalProperties: any): any[] {
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
