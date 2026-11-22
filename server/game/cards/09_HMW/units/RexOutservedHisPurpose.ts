import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class RexOutservedHisPurpose extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5024073529',
            internalName: 'rex#outserved-his-purpose'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Friendly units with no abilities get +1/+1.',
            targetController: RelativePlayer.Self,
            matchTarget: (card) =>
                card.isUnit() &&
                card.getConstantAbilities().length === 0 &&
                card.getActionAbilities().length === 0 &&
                card.getTriggeredAbilities().length === 0 &&
                card.keywords.length === 0,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 1 })
        });
    }
}
