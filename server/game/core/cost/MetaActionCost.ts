import type { AbilityContext } from '../ability/AbilityContext';
import { WildcardLocation, RelativePlayer } from '../Constants';
import type { ICost, Result } from './ICost';
import type { GameSystem } from '../gameSystem/GameSystem';
import type { ISelectCardProperties } from '../../gameSystems/SelectCardSystem';
import { randomItem } from '../utils/Helpers';
import { GameActionCost } from './GameActionCost';

export class MetaActionCost extends GameActionCost implements ICost {
    constructor(
        gameSystem: GameSystem,
        public activePromptTitle: string
    ) {
        super(gameSystem);
    }

    override getActionName(context: AbilityContext): string {
        const { gameSystem } = this.gameSystem.generatePropertiesFromContext(context) as ISelectCardProperties;
        return gameSystem.name;
    }

    override canPay(context: AbilityContext): boolean {
        const properties = this.gameSystem.generatePropertiesFromContext(context) as ISelectCardProperties;
        let additionalProps = {
            controller: RelativePlayer.Self,
            location: properties.location || WildcardLocation.Any
        };
        return this.gameSystem.hasLegalTarget(context, additionalProps);
    }

    override addEventsToArray(events: any[], context: AbilityContext, result: Result): void {
        const properties = this.gameSystem.generatePropertiesFromContext(context) as ISelectCardProperties;
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
            location: properties.location || WildcardLocation.Any,
            controller: RelativePlayer.Self,
            cancelHandler: !result.canCancel ? null : () => (result.cancelled = true),
            subActionProperties: (target: any) => {
                context.costs[properties.gameSystem.name] = target;
                if (target.createSnapshot) {
                    context.costs[properties.gameSystem.name + 'StateWhenChosen'] = target.createSnapshot();
                }
                return properties.subActionProperties ? properties.subActionProperties(target) : {};
            }
        };
        this.gameSystem.addEventsToArray(events, context, additionalProps);
    }

    hasTargetsChosenByInitiatingPlayer(context: AbilityContext): boolean {
        return this.gameSystem.hasTargetsChosenByInitiatingPlayer(context);
    }

    override getCostMessage(context: AbilityContext): [string, any[]] {
        const properties = this.gameSystem.generatePropertiesFromContext(context) as ISelectCardProperties;
        return properties.gameSystem.getCostMessage(context);
    }
}
