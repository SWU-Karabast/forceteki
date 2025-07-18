import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class SupremeLeaderSnokeShadowRuler extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3731235174',
            internalName: 'supreme-leader-snoke#shadow-ruler',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each enemy non-leader unit gets -2/-2',
            targetController: RelativePlayer.Opponent,
            targetCardTypeFilter: WildcardCardType.NonLeaderUnit,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 })
        });
    }
}
