import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class GoForTheLegs extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2859074789',
            internalName: 'go-for-the-legs',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust an enemy ground unit.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                controller: RelativePlayer.Opponent,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            }
        });
    }
}