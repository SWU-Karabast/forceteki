import type { AbilityContext } from './AbilityContext.js';
import { CardAbility } from './CardAbility';
import { PhaseName, SubStepCheck } from '../Constants.js';
import type { IActionAbilityProps } from '../../Interfaces.js';
import type { Card } from '../card/Card.js';
import type Game from '../Game.js';
import type { ITargetResult } from './abilityTargets/TargetResolver.js';
import * as Contract from '../utils/Contract';
import type { IMeetsRequirementsProperties } from './PlayerOrCardAbility';

/**
 * Represents an action ability provided by card text.
 *
 * Properties:
 * title        - string that is used within the card menu associated with this
 *                action.
 * condition    - optional function that should return true when the action is
 *                allowed, false otherwise. It should generally be used to check
 *                if the action can modify game state (step #1 in ability
 *                resolution in the rules).
 * cost         - object or array of objects representing the cost required to
 *                be paid before the action will activate. See Costs.
 * phase        - string representing which phases the action may be executed.
 *                Defaults to 'any' which allows the action to be executed in
 *                any phase.
 * zone     - string indicating the zone the card should be in in order
 *                to activate the action. Defaults to 'play area'.
 * limit        - optional AbilityLimit object that represents the max number of
 *                uses for the action as well as when it resets.
 * clickToActivate - boolean that indicates the action should be activated when
 *                   the card is clicked.
 */
export class ActionAbility extends CardAbility {
    protected readonly anyPlayer: boolean;
    protected readonly doesNotTarget: boolean;
    protected readonly phase: string;

    public readonly condition?: (context?: AbilityContext) => boolean;
    public readonly requiresConfirmation: boolean;
    private earlyTargetResults?: ITargetResult;

    public override get isEpicAction(): boolean {
        return this.limit.isEpicActionLimit();
    }

    public constructor(game: Game, card: Card, properties: IActionAbilityProps) {
        super(game, card, properties);

        this.phase = properties.phase ?? PhaseName.Action;
        this.condition = properties.condition;
        this.requiresConfirmation = properties.requiresConfirmation ?? false;

        Contract.assertTrue(card.canRegisterActionAbilities(), `Card '${card.internalName}' cannot have action abilities`);
    }

    public override meetsRequirements(context: AbilityContext = this.createContext(), props: IMeetsRequirementsProperties = {}): string {
        if (!props.ignoredRequirements?.includes('zone') && !this.isInValidZone(context)) {
            return 'zone';
        }

        if (!props.ignoredRequirements?.includes('phase') && this.phase !== 'any' && this.phase !== this.game.currentPhase) {
            return 'phase';
        }

        if (!props.ignoredRequirements?.includes('condition') && this.condition && !this.condition(context)) {
            return 'condition';
        }

        return super.meetsRequirements(context, props);
    }

    public override resolveEarlyTargets(context: AbilityContext, passHandler?: any, canCancel: boolean = false): ITargetResult {
        this.earlyTargetResults = super.resolveEarlyTargets(context, passHandler, canCancel);

        this.game.queueSimpleStep(() => {
            if (this.earlyTargetResults.cancelled || !this.earlyTargetResults.canCancel) {
                return;
            }

            const requirements = this.meetsRequirements(
                context,
                {
                    ignoredRequirements: [],
                    thisStepOnly: true
                }
            );

            // We consider the action ability to have an effect if it meets the requirements and it has no costs or a legal effect.
            // Otherwise, we prompt the player to confirm that they didn't trigger it by mistake.
            if (requirements === '' && (
                (this.getCosts(context).length === 0 && !this.isEpicAction) || this.hasAnyLegalEffects(context, { includeSubSteps: SubStepCheck.ThenIfYouDo })
            )) {
                return;
            }

            this.game.promptWithHandlerMenu(context.player, {
                activePromptTitle: `The ability "${this.title}" will have no effect. Are you sure you want to use it?`,
                choices: ['Use it anyway', 'Cancel'],
                handlers: [
                    () => undefined,
                    () => {
                        this.earlyTargetResults.cancelled = true;
                    }
                ]
            });
        }, 'check if action ability has any effect');

        return this.earlyTargetResults;
    }

    public override isActionAbility(): this is ActionAbility {
        return true;
    }
}
