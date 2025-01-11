import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import type Game from '../core/Game';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { IViewCardProperties } from './ViewCardSystem';
import { ViewCardMode, ViewCardSystem } from './ViewCardSystem';

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

    public override eventHandler(event, additionalProperties = {}): void {
        (event.context.game as Game).promptLookAtCards(event.context.player,
            {
                source: event.context.source,
                displayCards: event.cards,
            }
        );
    }

    public override checkEventCondition(): boolean {
        return true;
    }
}
