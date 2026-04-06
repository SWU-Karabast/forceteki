import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class Fervor extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'fervor-id',
            internalName: 'fervor',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Ready a unit. Deal 3 damage to a unit',
            targetResolvers: {
                readyUnit: {
                    activePromptTitle: 'Ready a unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.ready(),
                },
                damageUnit: {
                    activePromptTitle: 'Deal 3 damage to a unit',
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
                }
            }
        });
    }
}