import type { AbilityContext } from '../ability/AbilityContext';
import type { Card } from '../card/Card';
import { WildcardZoneName, RelativePlayer } from '../Constants';
import type { ICost, ICostResult } from './ICost';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { ISelectCardProperties } from '../../gameSystems/SelectCardSystem';
import { GameSystemCost } from './GameSystemCost';
import type { GameEvent } from '../event/GameEvent';
import type { Player } from '../Player';

export class MetaActionCost<TContext extends AbilityContext = AbilityContext> extends GameSystemCost<TContext> implements ICost<TContext> {
    public constructor(
        public override gameSystem: GameSystem<TContext, ISelectCardProperties>,
        public activePromptTitle: string | ((context: TContext) => string)
    ) {
        super(gameSystem);
    }

    public override getActionName(context: TContext): string {
        const { immediateEffect } = this.gameSystem.generatePropertiesFromContext(context);
        return immediateEffect.name;
    }

    public override canPay(context: TContext): boolean {
        return this.gameSystem.hasLegalTarget(context);
    }

    public override isMetaActionCost(): this is MetaActionCost {
        return true;
    }

    public override queueGameStepsForAdjustmentsAndPayment(events: GameEvent[], context: TContext, result: ICostResult): void {
        const properties = this.gameSystem.generatePropertiesFromContext(context);

        const additionalProps = {
            activePromptTitle: this.activePromptTitle,
            zone: properties.zoneFilter || WildcardZoneName.Any,
            controller: RelativePlayer.Self,
            cancelHandler: !result.canCancel ? null : () => (result.cancelled = true),
            onSelectHandler: (target: Card | Card[]) => {
                context.costs[properties.name] = target;
            }
        };
        this.gameSystem.queueGenerateEventGameSteps(events, context, additionalProps);
    }

    public hasTargetsChosenByPlayer(context: TContext, player: Player = context.player): boolean {
        return this.gameSystem.hasTargetsChosenByPlayer(context, player);
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.gameSystem.generatePropertiesFromContext(context, { target: context.target });
        return properties.immediateEffect.getCostMessage(context);
    }
}
