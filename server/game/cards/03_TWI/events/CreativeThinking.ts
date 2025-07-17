import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class CreativeThinking extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0328412140',
            internalName: 'creative-thinking',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust a non-unique unit. Create a Clone Trooper token.',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    cardCondition: (card) => !card.unique,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust(),
                }),
                AbilityHelper.immediateEffects.createCloneTrooper((context) => ({ target: context.player })),
            ])
        });
    }
}
