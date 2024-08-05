import type { AbilityContext } from '../ability/AbilityContext';
import { WildcardLocations, Players } from '../Constants';
import type { ICost, Result } from './ICost';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { ISelectCardProperties } from '../../gameSystems/SelectCardSystem';
import { randomItem } from '../utils/Helpers';
import { GameActionCost } from './GameActionCost';

export class MetaActionCost extends GameActionCost implements ICost {
    constructor(
        action: GameSystem,
        public activePromptTitle: string
    ) {
        super(action);
    }

    getActionName(context: AbilityContext): string {
        const { gameSystem } = this.action.getProperties(context) as ISelectCardProperties;
        return gameSystem.name;
    }

    canPay(context: AbilityContext): boolean {
        const properties = this.action.getProperties(context) as ISelectCardProperties;
        let additionalProps = {
            controller: Players.Self,
            location: properties.location || WildcardLocations.Any
        };
        return this.action.hasLegalTarget(context, additionalProps);
    }

    addEventsToArray(events: any[], context: AbilityContext, result: Result): void {
        const properties = this.action.getProperties(context) as ISelectCardProperties;
        if (properties.targets && context.choosingPlayerOverride) {
            context.costs[properties.gameSystem.name] = randomItem(
                properties.selector.getAllLegalTargets(context, context.player)
            );
            context.costs[properties.gameSystem.name + 'StateWhenChosen'] =
                context.costs[properties.gameSystem.name].createSnapshot();
            return properties.gameSystem.addEventsToArray(events, context, {
                target: context.costs[properties.gameSystem.name]
            });
        }

        const additionalProps = {
            activePromptTitle: this.activePromptTitle,
            location: properties.location || WildcardLocations.Any,
            controller: Players.Self,
            cancelHandler: !result.canCancel ? null : () => (result.cancelled = true),
            subActionProperties: (target: any) => {
                context.costs[properties.gameSystem.name] = target;
                if (target.createSnapshot) {
                    context.costs[properties.gameSystem.name + 'StateWhenChosen'] = target.createSnapshot();
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
        const properties = this.action.getProperties(context) as ISelectCardProperties;
        return properties.gameSystem.getCostMessage(context);
    }
}
