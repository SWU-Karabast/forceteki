import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class HuyangEnduringInstructor extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8418001763',
            internalName: 'huyang#enduring-instructor',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Choose another friendly unit. While this unit is in play, the chosen unit gets +2/+2.',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.whileSourceInPlayCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            }
        });
    }
}
