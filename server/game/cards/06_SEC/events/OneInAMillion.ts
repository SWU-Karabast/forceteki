import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { AbilityRestriction, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';

export default class OneInAMillion extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'one-in-a-million-id',
            internalName: 'one-in-a-million',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This card can\'t be played from your hand',
            sourceZoneFilter: WildcardZoneName.Any,
            ongoingEffect: abilityHelper.ongoingEffects.cardCannot({
                cannot: AbilityRestriction.Play,
                restrictedActionCondition: (_, source) => source.zoneName === ZoneName.Hand,
            })
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