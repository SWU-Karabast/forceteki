import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class PowerFailure extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4323691274',
            internalName: 'power-failure',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat any number of upgrades on a unit',
            optional: true,
            targetResolvers: {
                selectedUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => card.isUnit() && card.upgrades.length > 0,
                },
                unitUpgrades: {
                    dependsOn: 'selectedUnit',
                    cardTypeFilter: WildcardCardType.Upgrade,
                    mode: TargetMode.Unlimited,
                    cardCondition: (card, context) => context.targets.selectedUnit.upgrades.includes(card),
                    immediateEffect: AbilityHelper.immediateEffects.defeat(),
                }
            }
        });
    }
}
