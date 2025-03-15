import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class MillenniumFalconGetOutAndPush extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8845408332',
            internalName: 'millennium-falcon#get-out-and-push',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'You may play or deploy 1 additional Pilot on this unit',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyPilotingLimit({ amount: 1 })
        });

        this.addConstantAbility({
            title: 'This unit gets +1/+0 for each Pilot on it',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: target.upgrades.reduce((count: number, upgrade: Card) => count + (upgrade.hasSomeTrait(Trait.Pilot) ? 1 : 0), 0),
                hp: 0
            })),
        });
    }
}
