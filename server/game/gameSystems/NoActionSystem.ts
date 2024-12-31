import type { AbilityContext } from '../core/ability/AbilityContext';
import { GameSystem, type IGameSystemProperties } from '../core/gameSystem/GameSystem';
import type { Card } from '../core/card/Card';
import { MetaEventName } from '../core/Constants';

export interface INoActionSystemProperties extends IGameSystemProperties {
    hasLegalTarget?: boolean;
}

/**
 * A {@link GameSystem} which executes a handler function
 * @override This was copied from L5R but has not been tested yet
 */
export class NoActionSystem<TContext extends AbilityContext = AbilityContext> extends GameSystem<TContext, INoActionSystemProperties> {
    protected override readonly eventName = MetaEventName.NoAction;
    protected override readonly defaultProperties: INoActionSystemProperties = {
        hasLegalTarget: false
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(event, additionalProperties = {}): void {}

    public override hasLegalTarget(context): boolean {
        const { hasLegalTarget: allowTargetSelection } = this.generatePropertiesFromContext(context);
        return allowTargetSelection;
    }

    public override canAffect(card: Card, context: TContext): boolean {
        const { hasLegalTarget: allowTargetSelection } = this.generatePropertiesFromContext(context);
        return allowTargetSelection;
    }

    protected override isTargetTypeValid(target: any): boolean {
        return true;
    }
}
