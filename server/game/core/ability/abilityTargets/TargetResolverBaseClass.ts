import { ITargetResolverBase } from '../../../TargetInterfaces';
import { AbilityContext } from '../AbilityContext';
import * as Contract from '../../utils/Contract';
import { GameSystem } from '../../gameSystem/GameSystem';
import PlayerOrCardAbility from '../PlayerOrCardAbility';
import { RelativePlayer } from '../../Constants';

/**
 * Base class for all target resolvers.
 */
export abstract class TargetResolverBaseClass<TProps extends ITargetResolverBase<AbilityContext>> {
    protected dependentTarget = null;
    protected dependentCost = null;
    public constructor(protected name:string, protected properties:TProps, ability:PlayerOrCardAbility) {
        if (this.properties.dependsOn) {
            const dependsOnTarget = ability.targetResolvers.find((target) => target.name === this.properties.dependsOn);

            // assert that the target we depend on actually exists
            Contract.assertNotNullLike(dependsOnTarget);

            dependsOnTarget.dependentTarget = this;
        }
    }

    protected canResolve(context) {
        // if this depends on another target, that will check hasLegalTarget already
        return !!this.properties.dependsOn || this.hasLegalTarget(context);
    }

    protected hasLegalTarget(context):boolean {
        return false;
    }

    protected getGameSystems(context:AbilityContext): GameSystem | GameSystem[] {
        return this.properties.immediateEffect ? [this.properties.immediateEffect] : [];
    }


    protected abstract getAllLegalTargets(context:AbilityContext)


    protected abstract resolve(context:AbilityContext, targetResults, passPrompt)


    protected abstract checkTarget(context:AbilityContext)

    protected getChoosingPlayer(context) {
        let playerProp = this.properties.choosingPlayer;
        if (typeof playerProp === 'function') {
            playerProp = playerProp(context);
        }
        return playerProp === RelativePlayer.Opponent ? context.player.opponent : context.player;
    }


    protected abstract hasTargetsChosenByInitiatingPlayer(context:AbilityContext):boolean
}
