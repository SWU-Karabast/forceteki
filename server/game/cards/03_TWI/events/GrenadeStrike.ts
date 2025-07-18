import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class GrenadeStrike extends EventCard {
    protected override getImplementationId() {
        return {
            id: '4042866439',
            internalName: 'grenade-strike',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 2 damage to a unit. You may deal 1 damage to another unit in the same arena.',
            targetResolvers: {
                firstUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: false,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                },
                secondUnit: {
                    dependsOn: 'firstUnit',
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: true,
                    cardCondition: (card, context) => card !== context.targets.firstUnit && card.zoneName === context.targets.firstUnit.zoneName,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }
}
