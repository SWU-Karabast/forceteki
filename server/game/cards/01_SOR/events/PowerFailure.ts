import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class PowerFailure extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4323691274',
            internalName: 'power-failure',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
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
