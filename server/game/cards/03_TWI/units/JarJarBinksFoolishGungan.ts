import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';

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
            immediateEffect: AbilityHelper.immediateEffects.randomSelection((context) => ({
                target: this.getAllTargets(context),
                innerSystem: AbilityHelper.immediateEffects.damage({
                    amount: 2
                })
            }))
        });
    }

    private getAllTargets(context: AbilityContext): Card[] {
        const controllerUnits = context.player.getArenaUnits();
        const opponentUnits = context.player.opponent.getArenaUnits();
        return [...controllerUnits, ...opponentUnits, context.player.opponent.base, context.player.base]; // All units and bases
    }
}
