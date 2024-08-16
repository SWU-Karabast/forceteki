import type { AbilityContext } from '../ability/AbilityContext';
import { WildcardLocation, RelativePlayer } from '../Constants';
import type { ICost, Result } from './ICost';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { ISelectCardProperties } from '../../gameSystems/SelectCardSystem';
import { randomItem } from '../utils/Helpers';
import { GameActionCost } from './GameActionCost';
import { GameEvent } from '../event/GameEvent';

export class MetaActionCost extends GameActionCost implements ICost {
    public constructor(
        gameSystem: GameSystem,
        public activePromptTitle: string
    ) {
        super(gameSystem);
    }

    public override getActionName(context: AbilityContext): string {
        const { innerSystem: gameSystem } = this.gameSystem.generatePropertiesFromContext(context) as ISelectCardProperties;
        return gameSystem.name;
    }

    public override canPay(context: AbilityContext): boolean {
        const properties = this.gameSystem.generatePropertiesFromContext(context) as ISelectCardProperties;
        const additionalProps = {
            controller: RelativePlayer.Self,
            locationFilter: properties.locationFilter || WildcardLocation.Any
        };
        return this.gameSystem.hasLegalTarget(context, additionalProps);
    }

    public override generateEventsForAllTargets(context: AbilityContext, result: Result): GameEvent[] {
        const properties = this.gameSystem.generatePropertiesFromContext(context) as ISelectCardProperties;
        if (properties.targets && context.choosingPlayerOverride) {
            context.costs[properties.innerSystem.name] = randomItem(
                properties.selector.getAllLegalTargets(context, context.player)
            );
            context.costs[properties.innerSystem.name + 'StateWhenChosen'] =
                context.costs[properties.innerSystem.name].createSnapshot();
            return properties.innerSystem.generateEventsForAllTargets(context, {
                target: context.costs[properties.innerSystem.name]
            });
        }

        const additionalProps = {
            activePromptTitle: this.activePromptTitle,
            location: properties.locationFilter || WildcardLocation.Any,
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
        return this.gameSystem.generateEventsForAllTargets(context, additionalProps);
    }

    public hasTargetsChosenByInitiatingPlayer(context: AbilityContext): boolean {
        return this.gameSystem.hasTargetsChosenByInitiatingPlayer(context);
    }

    public override getCostMessage(context: AbilityContext): [string, any[]] {
        const properties = this.gameSystem.generatePropertiesFromContext(context) as ISelectCardProperties;
        return properties.innerSystem.getCostMessage(context);
    }
}
