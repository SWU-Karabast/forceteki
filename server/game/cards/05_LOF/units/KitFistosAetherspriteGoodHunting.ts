import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class KitFistosAetherspriteGoodHunting extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'kit-fistos-aethersprite#good-hunting-id',
            internalName: 'kit-fistos-aethersprite#good-hunting',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat any number of upgrades on a unit',
            targetResolvers: {
                selectedUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.isUnit() && card.upgrades.length > 0,
                    optional: true,
                },
                unitUpgrades: {
                    dependsOn: 'selectedUnit',
                    canChooseNoCards: true,
                    cardTypeFilter: WildcardCardType.Upgrade,
                    mode: TargetMode.Unlimited,
                    cardCondition: (card, context) => context.targets.selectedUnit.upgrades.includes(card),
                    immediateEffect: AbilityHelper.immediateEffects.defeat(),
                }
            }
        });
    }
}