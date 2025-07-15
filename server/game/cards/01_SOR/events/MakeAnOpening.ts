import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class MakeAnOpening extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3208391441',
            internalName: 'make-an-opening',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Give a unit -2/-2 for this phase. Heal 2 damage from your base',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 }),
                    }),
                }),
                AbilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
            ])
        });
    }
}
