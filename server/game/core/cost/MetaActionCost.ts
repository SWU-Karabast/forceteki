import type { AbilityContext } from '../ability/AbilityContext';
import { WildcardZoneName, RelativePlayer } from '../Constants';
import type { ICost, ICostResult } from './ICost';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { ISelectCardProperties } from '../../gameSystems/SelectCardSystem';
import { randomItem } from '../utils/Helpers';
import { GameSystemCost } from './GameSystemCost';
import type { GameEvent } from '../event/GameEvent';
import type { Player } from '../Player';

export class MetaActionCost<TContext extends AbilityContext = AbilityContext> extends GameSystemCost<TContext> implements ICost<TContext> {
    public constructor(
        public override gameSystem: GameSystem<TContext, ISelectCardProperties>,
        public activePromptTitle: string
    ) {
        super(gameSystem);
    }

    public override getActionName(context: TContext): string {
        const { innerSystem: gameSystem } = this.gameSystem.generatePropertiesFromContext(context);
        return gameSystem.name;
    }

    public override canPay(context: TContext): boolean {
        return this.gameSystem.hasLegalTarget(context);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, result: ICostResult): void {
        const properties = this.gameSystem.generatePropertiesFromContext(context);
        if (properties.checkTarget && context.choosingPlayerOverride) {
            context.costs[properties.innerSystem.name] = randomItem(
                properties.selector.getAllLegalTargets(context),
                context.game.randomGenerator
            );
            context.costs[properties.innerSystem.name + 'StateWhenChosen'] =
                context.costs[properties.innerSystem.name].createSnapshot();
            properties.innerSystem.queueGenerateEventGameSteps(events, context, {
                target: context.costs[properties.innerSystem.name]
            });
        }

        const additionalProps = {
            activePromptTitle: this.activePromptTitle,
            zone: properties.zoneFilter || WildcardZoneName.Any,
            controller: RelativePlayer.Self,
            cancelHandler: !result.canCancel ? null : () => (result.cancelled = true),
            subActionProperties: (target: any) => {
                context.costs[properties.innerSystem.name] = target;
                if (target.createSnapshot) {
                    context.costs[properties.innerSystem.name + 'StateWhenChosen'] = target.createSnapshot();
                }
                return properties.innerSystemProperties ? properties.innerSystemProperties(target) : {};
            }
        };
        this.gameSystem.queueGenerateEventGameSteps(events, context, additionalProps);
    }

    public hasTargetsChosenByPlayer(context: TContext, player: Player = context.player): boolean {
        return this.gameSystem.hasTargetsChosenByPlayer(context, player);
    }

    public override getCostMessage(context: TContext): [string, any[]] {
        const properties = this.gameSystem.generatePropertiesFromContext(context, { target: context.target });
        return properties.innerSystem.getCostMessage(context);
    }
}
