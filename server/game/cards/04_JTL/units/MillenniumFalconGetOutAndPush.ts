import type { IAbilityHelper } from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class MillenniumFalconGetOutAndPush extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8845408332',
            internalName: 'millennium-falcon#get-out-and-push',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'You may play or deploy 1 additional Pilot on this unit',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyPilotingLimit({ amount: 1 })
        });

        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for each Pilot on it',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: target.upgrades.reduce((count: number, upgrade: Card) => count + (upgrade.hasSomeTrait(Trait.Pilot) ? 1 : 0), 0),
                hp: 0
            })),
        });
    }
}
