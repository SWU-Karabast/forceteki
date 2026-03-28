import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TakeAction extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'take-action-id',
            internalName: 'take-action',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addDecreaseCostAbility({
            title: `This event costs ${TextHelper.resource(1)} less to play for each friendly leader unit`,
            amount: (_, player) => player.getArenaUnits({ condition: (c) => c.isLeaderUnit() }).length,
        });

        registrar.setEventAbility({
            title: 'Deal 3 damage to a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });
    }
}