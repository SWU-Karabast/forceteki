import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, Trait, WildcardCardType } from '../../../core/Constants';

export default class WingGuardSecurityTeam extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7508489374',
            internalName: 'wing-guard-security-team',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
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

