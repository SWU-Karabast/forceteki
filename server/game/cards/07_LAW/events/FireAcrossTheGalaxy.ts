import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, TargetMode, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class FireAcrossTheGalaxy extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3669825370',
            internalName: 'fire-across-the-galaxy',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Use any number of When Played abilities on friendly Spectre units',
            targetResolver: {
                mode: TargetMode.Unlimited,
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card) => card.hasSomeTrait(Trait.Spectre) && card.canRegisterTriggeredAbilities() && card.getTriggeredAbilities().some((ability) => ability.isWhenPlayed),
                immediateEffect: AbilityHelper.immediateEffects.useWhenPlayedAbility()
            }
        });
    }
}