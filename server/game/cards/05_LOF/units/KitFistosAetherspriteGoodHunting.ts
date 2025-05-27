import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class KitFistosAetherspriteGoodHunting extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1028870559',
            internalName: 'kit-fistos-aethersprite#good-hunting',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
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