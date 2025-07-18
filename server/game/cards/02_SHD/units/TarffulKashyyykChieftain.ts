import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TarffulKashyyykChieftain extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7022736145',
            internalName: 'tarfful#kashyyyk-chieftain'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'That unit deals that much damage to an enemy ground unit',
            when: {
                onDamageDealt: (event, context) =>
                    event.type === DamageType.Combat &&
                    !event.willDefeat &&
                    event.card.hasSomeTrait(Trait.Wookiee) &&
                    event.card.controller === context.player
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.event.amount,
                    source: context.event.card
                }))
            }
        });
    }
}
