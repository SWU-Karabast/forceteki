import { ITargetResolverBase } from '../../../TargetInterfaces';
import { AbilityContext } from '../AbilityContext';
import * as Contract from '../../utils/Contract';
import { GameSystem } from '../../gameSystem/GameSystem';
import PlayerOrCardAbility from '../PlayerOrCardAbility';
import { RelativePlayer, Stage } from '../../Constants';

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
                throw new Error('Attempting to set a dependent target for source target <insert target name here> but it already has one. Having multiple dependent targets for the same source target has not yet been implemented');
            }

            dependsOnTarget.dependentTarget = this;
        }
    }

    protected abstract hasLegalTarget(context): boolean;

    protected abstract getAllLegalTargets(context: AbilityContext): any[];

    protected abstract checkTarget(context: AbilityContext): boolean;

    protected abstract hasTargetsChosenByInitiatingPlayer(context: AbilityContext): boolean;

    protected canResolve(context) {
        // if this depends on another target, that will check hasLegalTarget already
        return !!this.properties.dependsOn || this.hasLegalTarget(context);
    }

    protected resolve(context: AbilityContext, targetResults, passPrompt = null) {
        if (targetResults.cancelled || targetResults.payCostsFirst || targetResults.delayTargeting) {
            return false;
        }

        if ('condition' in this.properties && typeof this.properties.condition === 'function' && !this.properties.condition(context)) {
            return false;
        }

        const player = context.choosingPlayerOverride || this.getChoosingPlayer(context);
        if (player === context.player.opponent && context.stage === Stage.PreTarget) {
            targetResults.delayTargeting = this;
            return false;
        }

        return true;
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
