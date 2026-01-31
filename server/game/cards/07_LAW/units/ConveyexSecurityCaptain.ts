import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ConveyexSecurityCaptain extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7864585126',
            internalName: 'conveyex-security-captain',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Enemy Credit tokens lose all abilities',
            targetController: RelativePlayer.Opponent,
            targetZoneFilter: ZoneName.Base,
            targetCardTypeFilter: WildcardCardType.Token,
            matchTarget: (card) => card.isCreditToken(),
            ongoingEffect: abilityHelper.ongoingEffects.loseAllAbilities()
        });
    }
}