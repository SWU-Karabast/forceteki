import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class ANewOrder extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0522959604',
            internalName: 'a-new-order',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give an Advantage token to each of up to 2 units',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveAdvantage()
            }
        });
    }
}