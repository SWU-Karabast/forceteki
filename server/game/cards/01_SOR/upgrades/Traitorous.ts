import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Traitorous extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8055390529',
            internalName: 'traitorous'
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Take control of attached unit',
            when: {
                onUpgradeAttached: (event, context) => event.upgradeCard === context.source &&
                  event.parentCard.isNonLeaderUnit() &&
                  event.parentCard.cost <= 3,
            },
            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                target: context.event.parentCard,
                newController: context.source.controller
            }))
        });

        registrar.addTriggeredAbility({
            title: 'That unit’s owner takes control of it',
            when: {
                onUpgradeUnattached: (event, context) => event.upgradeCard === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                target: context.event.parentCard,
                newController: context.event.parentCard.owner,
                excludeLeaderUnit: false
            }))
        });
    }
}
