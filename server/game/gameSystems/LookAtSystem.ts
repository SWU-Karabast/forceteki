import type { AbilityContext } from '../core/ability/AbilityContext';
import { EventName } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { IViewCardProperties } from './ViewCardSystem';
import { ViewCardMode, ViewCardsSystem } from './ViewCardSystem';

export type ILookAtProperties = Omit<IViewCardProperties, 'viewType'>;

export class LookAtSystem<TContext extends AbilityContext = AbilityContext> extends ViewCardsSystem<TContext> {
    public override readonly name = 'lookAt';
    public override readonly eventName = EventName.OnLookAtCard;
    public override readonly effectDescription = 'look at a card';

    protected override defaultProperties: IViewCardProperties = {
        viewType: ViewCardMode.LookAt
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: ILookAtProperties | ((context?: AbilityContext) => ILookAtProperties)) {
        const propsWithViewType = GameSystem.appendToPropertiesOrPropertyFactory<IViewCardProperties, 'viewType'>(propertiesOrPropertyFactory, { viewType: ViewCardMode.LookAt });
        super(propsWithViewType);
    }

    public override checkEventCondition(): boolean {
        return true;
    }
}
