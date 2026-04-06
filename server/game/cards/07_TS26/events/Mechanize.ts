import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class Mechanize extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'mechanize-id',
            internalName: 'mechanize',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.setEventAbility({
            title: 'Play a non-Vehicle unit from your discard pile and give an Experience token to it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: abilityHelper.immediateEffects.sequential({
                    gameSystems: [
                        abilityHelper.immediateEffects.playCardFromOutOfPlay({ playAsType: WildcardCardType.Unit }),
                        abilityHelper.immediateEffects.giveExperience({ amount: 1 }),
                    ],
                })
            }
        });
    }
}