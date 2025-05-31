import type { ITargetResolverBase } from '../../../TargetInterfaces';
import type { AbilityContext } from '../AbilityContext';
import * as Contract from '../../utils/Contract';
import type { GameSystem } from '../../gameSystem/GameSystem';
import type { PlayerOrCardAbility } from '../PlayerOrCardAbility';
import { RelativePlayer, Stage } from '../../Constants';
import type { Player } from '../../Player';

export interface ITargetResult {
    canIgnoreAllCosts?: boolean;
    cancelled?: boolean;
    payCostsFirst?: boolean;
    delayTargeting?: TargetResolver<ITargetResolverBase<AbilityContext>>;
    canCancel?: boolean;
    hasEffectiveTargets?: boolean;
}

/**
 * Base class for all target resolvers.
 */
export abstract class TargetResolver<TProps extends ITargetResolverBase<AbilityContext>> {
    public readonly dependsOnOtherTarget;

    protected dependentTarget = null;
    protected dependentCost = null;

    public constructor(public name: string, protected properties: TProps, ability: PlayerOrCardAbility = null) {
        if (this.properties.dependsOn) {
            this.dependsOnOtherTarget = true;
            Contract.assertNotNullLike(ability);

            const dependsOnTarget = ability.targetResolvers.find((target) => target.name === this.properties.dependsOn);

            // assert that the target we depend on actually exists
            Contract.assertNotNullLike(dependsOnTarget);
            // TODO: Change the dependsOn system to allow multiple dependent targets.
            if (dependsOnTarget.dependentTarget != null) {
                throw new Error(`Attempting to set dependent target ${this.name} for source target ${dependsOnTarget.name} but it already has one. Having multiple dependent targets for the same source target has not yet been implemented`);
            }

            dependsOnTarget.dependentTarget = this;
        } else {
            this.dependsOnOtherTarget = false;
        }
    }

    protected abstract hasLegalTarget(context: AbilityContext): boolean;

    protected abstract checkTarget(context: AbilityContext): boolean;

    protected abstract hasTargetsChosenByPlayerInternal(context: AbilityContext, player?: Player): boolean;

    protected abstract resolveInternal(context: AbilityContext, targetResults: ITargetResult, passPrompt, player: Player);

    protected canResolve(context: AbilityContext) {
        // if this depends on another target, that will check hasLegalTarget already
        return !!this.properties.dependsOn || this.hasLegalTarget(context);
    }

    public resolve(context: AbilityContext, targetResults: ITargetResult, passPrompt = null) {
        if (targetResults.cancelled || targetResults.payCostsFirst || targetResults.delayTargeting) {
            return;
        }

        if ('condition' in this.properties && typeof this.properties.condition === 'function' && !this.properties.condition(context)) {
            return;
        }

        const player = this.getChoosingPlayer(context);
        if (player === context.player.opponent && context.stage === Stage.PreTarget) {
            targetResults.delayTargeting = this;
            return;
        }

        this.resolveInternal(context, targetResults, passPrompt, player);
    }

    protected getDefaultProperties(context: AbilityContext) {
        const activePromptTitleConcrete = typeof this.properties.activePromptTitle === 'function' ? this.properties.activePromptTitle(context) : this.properties.activePromptTitle;
        return {
            activePromptTitle: activePromptTitleConcrete,
            waitingPromptTitle: 'waitingPromptTitle' in this.properties
                ? this.properties.waitingPromptTitle as string
                : (context.ability.type === 'action' ? 'Waiting for opponent to take an action or pass' : 'Waiting for opponent'),
            context: context,
            source: context.source
        };
    }

    protected setTargetResult(context: AbilityContext, target) {
        context.targets[this.name] = target;
        if (this.name === 'target') {
            context.target = target;
        }
    }

    public hasTargetsChosenByPlayer(context: AbilityContext, player: Player = context.player) {
        if (this.getChoosingPlayer(context) === player) {
            return true;
        }

        Contract.assertFalse(
            this.dependsOnOtherTarget &&
            context.targets[this.properties.dependsOn] == null &&
            context.selects[this.properties.dependsOn] == null,
            `Attempting to evaluate target resolver '${this.name}' but dependent target '${this.properties.dependsOn}' is not present in context`
        );

        return this.hasTargetsChosenByPlayerInternal(context, player);
    }

    public getChoosingPlayer(context: AbilityContext) {
        if (context.choosingPlayerOverride) {
            return context.choosingPlayerOverride;
        }

        let playerProp = this.properties.choosingPlayer;
        if (typeof playerProp === 'function') {
            playerProp = playerProp(context);
        }
        return playerProp === RelativePlayer.Opponent ? context.player.opponent : context.player;
    }

    protected getGameSystems(context: AbilityContext): GameSystem | GameSystem[] {
        return this.properties.immediateEffect ? [this.properties.immediateEffect] : [];
    }
}
