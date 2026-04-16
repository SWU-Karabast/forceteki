import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Encircle extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'encircle-id',
            internalName: 'encircle',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `This event costs ${TextHelper.resource(1)} less to play for each friendly unit`,
            amount: (_, player) => player.getArenaUnits().length,
        });

        registrar.setEventAbility({
            title: 'A friendly unit captures an enemy non-leader unit in the same arena',
            targetResolvers: {
                friendlyUnit: {
                    zoneFilter: WildcardZoneName.AnyArena,
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit
                },
                captureUnit: {
                    dependsOn: 'friendlyUnit',
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card, context) => card.zoneName === context.targets['friendlyUnit'].zoneName,
                    immediateEffect: abilityHelper.immediateEffects.capture((context) => ({ captor: context.targets['friendlyUnit'] }))
                }
            }
        });
    }
}