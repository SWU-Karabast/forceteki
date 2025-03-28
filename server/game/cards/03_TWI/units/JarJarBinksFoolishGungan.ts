import AbilityHelper from '../../../AbilityHelper';
import * as Helpers from '../../../core/utils/Helpers';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class JarJarBinksFoolishGungan extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9216621233',
            internalName: 'jar-jar-binks#foolish-gungan',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Deal 2 damage to a random unit or base',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: 2, target: this.chooseRandomTarget(context) })),
        });
    }

    private chooseRandomTarget(context) {
        const controllerUnits = context.player.getArenaUnits();
        const opponentUnits = context.player.opponent.getArenaUnits();
        const allTargets = [...controllerUnits, ...opponentUnits, context.player.opponent.base, context.player.base]; // All units and bases
        return Helpers.randomItem(allTargets, context.game.randomGenerator);
    }
}
