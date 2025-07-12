import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class Salvage extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2614693321',
            internalName: 'salvage',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Play a Vehicle unit from your discard pile (paying its cost)',
            targetResolver: {
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({ playAsType: WildcardCardType.Unit })
            },
            then: (thenContext) => ({
                title: 'Deal 1 damage to the played unit',
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    target: thenContext.target,
                    amount: 1,
                })
            })
        });
    }
}
