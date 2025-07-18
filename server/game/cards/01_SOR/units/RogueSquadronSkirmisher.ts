import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class RogueSquadronSkirmisher extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3377409249',
            internalName: 'rogue-squadron-skirmisher',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return a unit that costs 2 or less from your discard pile to your hand.',
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand(),
                cardCondition: (card) => card.isUnit() && card.cost <= 2,
            },
        });
    }
}
