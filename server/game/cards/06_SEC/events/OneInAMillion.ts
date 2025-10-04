import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class OneInAMillion extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3612601170',
            internalName: 'one-in-a-million',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addPlayRestrictionAbility({
            title: 'This card can\'t be played from your hand',
            restrictedActionCondition: (_, source) => source.zoneName === ZoneName.Hand,
        });

        registrar.setEventAbility({
            title: 'Defeat a unit with power and remaining HP both equal to the number of ready resources you control',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) =>
                    card.isUnit() &&
                    card.getPower() === context.player.readyResourceCount &&
                    card.remainingHp === context.player.readyResourceCount,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            }
        });
    }
}