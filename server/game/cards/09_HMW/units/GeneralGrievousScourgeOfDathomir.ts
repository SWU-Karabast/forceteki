import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction, CardType, WildcardRelativePlayer, ZoneName } from '../../../core/Constants';

export default class GeneralGrievousScourgeOfDathomir extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'general-grievous#scourge-of-dathomir-id',
            internalName: 'general-grievous#scourge-of-dathomir',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Bases can not be healed',
            targetZoneFilter: ZoneName.Base,
            targetController: WildcardRelativePlayer.Any,
            targetCardTypeFilter: CardType.Base,
            ongoingEffect: abilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeHealed)
        });

        registrar.addWhenPlayedAbility({
            title: 'Deal 4 damage to a base',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 4 })
            }
        });
    }
}