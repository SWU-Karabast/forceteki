import { AbilityContext } from '../core/ability/AbilityContext';
import { BaseCard } from '../core/card/BaseCard';
import { EventName, ViewCardType } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { ViewCardSystem, IViewCardProperties } from './ViewCardSystem';

export type ILookAtProperties = Omit<IViewCardProperties, 'viewType'>;

export class LookAtSystem extends ViewCardSystem {
    public override readonly name = 'lookAt';
    public override readonly eventName = EventName.OnLookAtCards;
    public override readonly effectDescription = 'look at a card';

    protected override defaultProperties: IViewCardProperties = {
        sendChatMessage: false,
        message: '{0} sees {1}',
        viewType: ViewCardType.LookAt
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: ILookAtProperties | ((context?: AbilityContext) => ILookAtProperties)) {
        let propertyWithViewType: IViewCardProperties | ((context?: AbilityContext) => IViewCardProperties);

        if (typeof propertiesOrPropertyFactory === 'function') {
            propertyWithViewType = (context?: AbilityContext) => Object.assign(propertiesOrPropertyFactory(context), { viewType: ViewCardType.LookAt });
        } else {
            propertyWithViewType = Object.assign(propertiesOrPropertyFactory, { viewType: ViewCardType.LookAt });
        }

        super(propertyWithViewType);
    }

    public override eventHandler(event, additionalProperties = {}): void {
        const context = event.context;
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const messageArgs = properties.messageArgs ? properties.messageArgs(event.cards) : [context.source, event.cards];
        context.game.addMessage(this.getMessage(properties.message, context), ...messageArgs);
    }

    public override checkEventCondition(): boolean {
        return true;
    }
}
