import AbilityHelper from '../../../AbilityHelper';
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
        const controllerTargets = context.source.controller.getUnitsInPlay(WildcardZoneName.AnyArena);
        const opponentTargets = context.source.controller.opponent.getUnitsInPlay(WildcardZoneName.AnyArena);
        const allTargets = [...controllerTargets, ...opponentTargets, context.source.controller.opponent.base, context.source.controller.base];
        const selectedTarget = allTargets[Math.floor(Math.random() * allTargets.length)];
        return selectedTarget;
    }
}
