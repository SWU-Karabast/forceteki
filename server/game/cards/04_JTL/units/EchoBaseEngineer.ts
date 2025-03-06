import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class EchoBaseEngineer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3660641793',
            internalName: 'echo-base-engineer',
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Give a Shield token',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUnit() && card.damage !== 0 && card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}
