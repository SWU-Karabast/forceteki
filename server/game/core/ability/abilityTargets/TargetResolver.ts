import { ITargetResolverBase } from '../../../TargetInterfaces';
import { AbilityContext } from '../AbilityContext';
import * as Contract from '../../utils/Contract';
import { GameSystem } from '../../gameSystem/GameSystem';
import PlayerOrCardAbility from '../PlayerOrCardAbility';
import { RelativePlayer, Stage } from '../../Constants';
import type Player from '../../Player';

/**
 * Base class for all target resolvers.
 */
export abstract class TargetResolver<TProps extends ITargetResolverBase<AbilityContext>> {
    protected dependentTarget = null;
    protected dependentCost = null;

    public constructor(protected name: string, protected properties: TProps, ability: PlayerOrCardAbility) {
        if (this.properties.dependsOn) {
            const dependsOnTarget = ability.targetResolvers.find((target) => target.name === this.properties.dependsOn);

            // assert that the target we depend on actually exists
            Contract.assertNotNullLike(dependsOnTarget);
            // TODO: Change the dependsOn system to allow multiple dependent targets.
            if (dependsOnTarget.dependentTarget != null) {
                throw new Error(`Attempting to set dependent target ${this.name} for source target ${dependsOnTarget.name} but it already has one. Having multiple dependent targets for the same source target has not yet been implemented`);
            }

            dependsOnTarget.dependentTarget = this;
        }
    }

    protected abstract hasLegalTarget(context: AbilityContext): boolean;

    protected abstract checkTarget(context: AbilityContext): boolean;

    protected abstract hasTargetsChosenByInitiatingPlayer(context: AbilityContext): boolean;

    protected abstract resolveInner(context: AbilityContext, targetResults, passPrompt, player: Player);

    protected canResolve(context) {
        // if this depends on another target, that will check hasLegalTarget already
        return !!this.properties.dependsOn || this.hasLegalTarget(context);
    }

    protected resolve(context: AbilityContext, targetResults, passPrompt = null) {
        if (targetResults.cancelled || targetResults.payCostsFirst || targetResults.delayTargeting) {
            return;
        }

        if ('condition' in this.properties && typeof this.properties.condition === 'function' && !this.properties.condition(context)) {
            return;
        }

        const player = context.choosingPlayerOverride || this.getChoosingPlayer(context);
        if (player === context.player.opponent && context.stage === Stage.PreTarget) {
            targetResults.delayTargeting = this;
            return;
        }

        this.resolveInner(context, targetResults, passPrompt, player);
    }

    protected getDefaultProperties(context: AbilityContext) {
        return {
            activePromptTitle: this.properties.activePromptTitle,
            waitingPromptTitle: 'waitingPromptTitle' in this.properties
                ? this.properties.waitingPromptTitle as string
                : (context.ability.type === 'action' ? 'Waiting for opponent to take an action or pass' : 'Waiting for opponent'),
            context: context,
            source: context.source
        };
    }

    protected setTargetResult(context, target) {
        context.targets[this.name] = target;
        if (this.name === 'target') {
            context.target = target;
        }
    }

    protected getChoosingPlayer(context) {
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
