import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class LetsCallItWar extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'lets-call-it-war-id',
            internalName: 'lets-call-it-war',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Deal 2 damage to a unit. You may deal 1 damage to another unit in the same arena.',
            targetResolvers: {
                firstUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: false,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
                },
                secondUnit: {
                    dependsOn: 'firstUnit',
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: true,
                    condition: (context) => context.player.hasInitiative(),
                    cardCondition: (card, context) => card !== context.targets.firstUnit && card.zoneName === context.targets.firstUnit.zoneName,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }
            }
        });
    }
}