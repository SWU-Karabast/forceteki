import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class VonregsTieInterceptorAceOfTheFirstOrder extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2948071304',
            internalName: 'vonregs-tie-interceptor#ace-of-the-first-order'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'While this unit has 4 or more power, it gains Overwhelm.',
            condition: (context) => context.source.getPower() >= 4,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
        });

        this.addConstantAbility({
            title: 'While this unit has 6 or more power, it gains Raid 1.',
            condition: (context) => context.source.getPower() >= 6,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }
}
