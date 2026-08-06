import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class StreetGangRecruiter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2090698177',
            internalName: 'street-gang-recruiter'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: `Return an ${TextHelper.Trait.Underworld} card from your discard pile to your hand.`,
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.hasSomeTrait(Trait.Underworld),
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}
