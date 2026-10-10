import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem, type IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { Card } from '../core/card/Card';
import { MetaEventName } from '../core/Constants';
import type { GameObject } from '../core/GameObject';

export interface INoActionSystemProperties extends IGameSystemProperties {
    hasLegalTarget?: boolean;
}

/**
 * A {@link GameSystem} which executes a handler function
 * @override This was copied from L5R but has not been tested yet
 */
export class NoActionSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, INoActionSystemProperties> {
    public override readonly eventName = MetaEventName.NoAction;
    protected override readonly defaultProperties: IGameSystemInput<INoActionSystemProperties> = {
        hasLegalTarget: false
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override eventHandlerInternal(): void {}

    protected override hasLegalTargetInternal(context, properties: INoActionSystemProperties): boolean {
        const { hasLegalTarget: allowTargetSelection } = properties;
        return allowTargetSelection;
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: INoActionSystemProperties): boolean {
        const { hasLegalTarget: allowTargetSelection } = properties;
        return allowTargetSelection;
    }

    protected override isTargetTypeValid(target: GameObject): boolean {
        return true;
    }
}
