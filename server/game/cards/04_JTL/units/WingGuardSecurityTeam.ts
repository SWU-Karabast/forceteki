import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class WingGuardSecurityTeam extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7508489374',
            internalName: 'wing-guard-security-team',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token to each of up to 2 Fringe units',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 2,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Fringe),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}

