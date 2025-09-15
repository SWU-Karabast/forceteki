import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class KyloRensCommandShuttleIconOfAuthority extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'kylo-rens-command-shuttle#icon-of-authority-id',
            internalName: 'kylo-rens-command-shuttle#icon-of-authority',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly ground unit with Sentinel gets +0/+2.',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: WildcardCardType.Unit,
            targetZoneFilter: ZoneName.GroundArena,
            matchTarget: (card) => card.hasSomeKeyword(KeywordName.Sentinel),
            ongoingEffect: [
                AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 2 })
            ]
        });
    }
}