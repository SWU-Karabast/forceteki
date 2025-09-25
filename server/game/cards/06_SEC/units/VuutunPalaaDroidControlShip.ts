import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class VuutunPalaaDroidControlShip extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9831248752',
            internalName: 'vuutun-palaa#droid-control-ship',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addDecreaseCostAbility({
            title: 'This unit costs 1 resource less to play for each friendly Droid unit',
            amount: (_, player) => player.getArenaUnits({ trait: Trait.Droid }).length
        });

        registrar.addConstantAbility({
            title: 'Each friendly Droid unit may be exhausted to pay costs',
            ongoingEffect: AbilityHelper.ongoingEffects.canExhaustUnitsInsteadOfResources({
                cardCondition: (card, _) => card.hasSomeTrait(Trait.Droid)
            })
        });
    }
}