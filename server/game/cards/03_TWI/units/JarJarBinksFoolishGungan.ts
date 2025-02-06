import AbilityHelper from '../../../AbilityHelper';
import * as Helpers from '../../../core/utils/Helpers';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardZoneName } from '../../../core/Constants';

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
        const controllerUnits = context.source.controller.getUnitsInPlay(WildcardZoneName.AnyArena);
        const opponentUnits = context.source.controller.opponent.getUnitsInPlay(WildcardZoneName.AnyArena);
        const allTargets = [...controllerUnits, ...opponentUnits, context.source.controller.opponent.base, context.source.controller.base]; // All units and bases
        return Helpers.randomItem(allTargets, context.game.randomGenerator);
    }
}
