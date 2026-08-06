import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class PegasusTriWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5027901038',
            internalName: 'pegasus-triwing',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a friendly upgrade. If you do, ready this unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            },
            ifYouDo: {
                title: 'Ready this unit',
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}