import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class KeepThemTalking extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3228349929',
            internalName: 'keep-them-talking',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust up to two units that each cost 3 or less',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}