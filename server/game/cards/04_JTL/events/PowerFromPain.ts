import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';

export default class PowerFromPain extends EventCard {
    protected override getImplementationId () {
        return {
            id: '3858069945',
            internalName: 'power-from-pain',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a unit +1/+0 for each damage on it',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: context.target.damage, hp: 0 })
                }))
            }
        });
    }
}
