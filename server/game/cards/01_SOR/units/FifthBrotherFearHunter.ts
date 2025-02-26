import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class FifthBrotherFearHunter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8395007579',
            internalName: 'fifth-brother#fear-hunter',
        };
    }

    protected override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Deal 1 damage to this unit and 1 damage to another ground unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.damage((context) => ({
                    target: context.source,
                    amount: 1
                })),
                AbilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: ZoneName.GroundArena,
                    cardCondition: (card, context) => card !== context.source,
                    innerSystem: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                })
            ])
        });

        this.addConstantAbility({
            title: 'This unit gains Raid 1 for each damage on him',
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(
                (target) => ({ keyword: KeywordName.Raid, amount: target.damage })
            )
        });
    }
}
