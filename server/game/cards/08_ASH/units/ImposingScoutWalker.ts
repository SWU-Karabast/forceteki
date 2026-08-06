import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class ImposingScoutWalker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8185107573',
            internalName: 'imposing-scout-walker',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 3 damage to a ground unit. If it\'s defeated this way, give 3 Advantage tokens to this unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            },
            ifYouDo: {
                title: 'Give 3 Advantage tokens to this unit',
                ifYouDoCondition: (ifYouDoContext) => ifYouDoContext.resolvedEvents[0].willDefeat,
                immediateEffect: AbilityHelper.immediateEffects.giveAdvantage({ amount: 3 })
            }
        });
    }
}