import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, KeywordName } from '../../../core/Constants';

export default class SynaraSanLoyalToKragan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0252207505',
            internalName: 'synara-san#loyal-to-kragan',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'When this unit is exhausted, it gains \'Bounty - Deal 5 damage to a base\'',
            condition: (context) => context.source.exhausted,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({
                keyword: KeywordName.Bounty,
                ability: {
                    title: 'Deal 5 damage to a base',
                    immediateEffect: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: CardType.Base,
                        innerSystem: AbilityHelper.immediateEffects.damage({ amount: 5 })
                    })
                }
            })
        });
    }
}
