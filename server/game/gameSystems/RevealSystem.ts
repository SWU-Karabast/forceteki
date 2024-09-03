
import { AbilityContext } from '../core/ability/AbilityContext';
import { EventName, ViewCardType } from '../core/Constants';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import { IViewCardProperties } from './ViewCardSystem';

export type IRevealProperties = Omit<IViewCardProperties, 'viewType'>;

export class RevealSystem extends CardTargetSystem {
    public override readonly name = 'reveal';
    public override readonly eventName = EventName.OnCardRevealed;
    public override readonly costDescription = 'revealing {0}';
    public override readonly effectDescription = 'reveal a card';

    protected override readonly defaultProperties: IViewCardProperties = {
        sendChatMessage: true,
        viewType: ViewCardType.Reveal
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IRevealProperties | ((context?: AbilityContext) => IRevealProperties)) {
        let propertyWithViewType: IViewCardProperties | ((context?: AbilityContext) => IViewCardProperties);

        if (typeof propertiesOrPropertyFactory === 'function') {
            propertyWithViewType = (context?: AbilityContext) => Object.assign(propertiesOrPropertyFactory(context), { viewType: ViewCardType.Reveal });
        } else {
            propertyWithViewType = Object.assign(propertiesOrPropertyFactory, { viewType: ViewCardType.Reveal });
        }

        super(propertyWithViewType);
    }

    public override eventHandler(event, additionalProperties): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties) as IRevealProperties;
        if (properties.sendChatMessage) {
            event.context.game.addMessage(
                '{0} reveals {1} due to {2}',
                properties.player || event.context.player,
                event.card,
                event.context.source
            );
        }
    }
}
