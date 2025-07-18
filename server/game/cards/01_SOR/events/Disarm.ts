import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class Disarm extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2587711125',
            internalName: 'disarm',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give an enemy unit -4/-0 for the phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: 0 })
                })
            }
        });
    }
}
