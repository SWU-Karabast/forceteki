import type { AbilityContext } from '../AbilityContext';
import { WildcardLocations, Players } from '../Constants';
import type { Cost, Result } from './Costs';
import type { GameAction } from '../gameActions/GameAction';
import type { SelectCardProperties } from '../gameActions/SelectCardAction';
import { randomItem } from '../utils/helpers';
import { GameActionCost } from './GameActionCost';

export class MetaActionCost extends GameActionCost implements Cost {
    constructor(
        action: GameAction,
        public activePromptTitle: string
    ) {
        super(action);
    }

    getActionName(context: AbilityContext): string {
        const { gameAction } = this.action.getProperties(context) as SelectCardProperties;
        return gameAction.name;
    }

    canPay(context: AbilityContext): boolean {
        const properties = this.action.getProperties(context) as SelectCardProperties;
        let additionalProps = {
            controller: Players.Self,
            location: properties.location || WildcardLocations.Any
        };
        return this.action.hasLegalTarget(context, additionalProps);
    }

    addEventsToArray(events: any[], context: AbilityContext, result: Result): void {
        const properties = this.action.getProperties(context) as SelectCardProperties;
        if (properties.targets && context.choosingPlayerOverride) {
            context.costs[properties.gameAction.name] = randomItem(
                properties.selector.getAllLegalTargets(context, context.player)
            );
            context.costs[properties.gameAction.name + 'StateWhenChosen'] =
                context.costs[properties.gameAction.name].createSnapshot();
            return properties.gameAction.addEventsToArray(events, context, {
                target: context.costs[properties.gameAction.name]
            });
        }

        const additionalProps = {
            activePromptTitle: this.activePromptTitle,
            location: properties.location || WildcardLocations.Any,
            controller: Players.Self,
            cancelHandler: !result.canCancel ? null : () => (result.cancelled = true),
            subActionProperties: (target: any) => {
                context.costs[properties.gameAction.name] = target;
                if (target.createSnapshot) {
                    context.costs[properties.gameAction.name + 'StateWhenChosen'] = target.createSnapshot();
                }
                return properties.subActionProperties ? properties.subActionProperties(target) : {};
            }
        };
        this.action.addEventsToArray(events, context, additionalProps);
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext): boolean {
        return this.action.hasTargetsChosenByInitiatingPlayer(context);
    }

    getCostMessage(context: AbilityContext): [string, any[]] {
        const properties = this.action.getProperties(context) as SelectCardProperties;
        return properties.gameAction.getCostMessage(context);
    }
}
