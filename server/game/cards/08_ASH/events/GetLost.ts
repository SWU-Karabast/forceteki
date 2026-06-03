import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class GetLost extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3646952605',
            internalName: 'get-lost',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat an upgraded non-leader unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isNonLeaderUnit() && card.isUpgraded(),
                immediateEffect: abilityHelper.immediateEffects.defeat()
            },
        });
    }
}