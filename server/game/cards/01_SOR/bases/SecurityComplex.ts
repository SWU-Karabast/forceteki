import { BaseCard } from "../../../core/card/BaseCard";
import AbilityHelper from "../../../AbilityHelper";

export default class SecurityComplex extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '2429341052',
            internalName: 'security-complex',
        };
    }

    public override setupCardAbilities () {
        this.setEpicActionAbility({
            title: 'Give a Shield token to a non-leader unit',
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit(),
                immediateEffect: AbilityHelper.immediateEffects.giveShield()
            }
        });
    }
}

SecurityComplex.implemented = true;
