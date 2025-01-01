import AbilityHelper from '../../../AbilityHelper';
import * as KeywordHelpers from '../../../core/ability/KeywordHelpers';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

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
                    controller: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.GroundArena,
                    cardCondition: (card, context) => card !== context.source,
                    innerSystem: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                })
            ])
        });

        this.addConstantAbility({
            title: 'This unit gains Raid 1 for each damage on him',
            ongoingEffect: OngoingEffectBuilder.card.dynamic(EffectName.GainKeyword, (target) => KeywordHelpers.keywordFromProperties({ keyword: KeywordName.Raid, amount: target.damage })),
        });
    }
}

FifthBrotherFearHunter.implemented = true;
