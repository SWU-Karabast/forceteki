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
            title: 'You may deal 1 damage to this unit and 1 damage to another ground unit.',
            optional: true,
            targetResolvers: {
                myGroundUnit: {
                    cardCondition: (card, context) => card === context.source,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                },
                theirGroundUnit: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                }
            },
        });

        this.addConstantAbility({
            title: 'This unit gains RAID 1 for each damage on him.',
            matchTarget: (card, context) => card === context.source,
            condition: (context) => context.source.damage > 0,
            ongoingEffect: OngoingEffectBuilder.card.dynamic(EffectName.GainKeyword, (target) => KeywordHelpers.keywordFromProperties({ keyword: KeywordName.Raid, amount: target.damage })),
        });
    }
}

FifthBrotherFearHunter.implemented = true;
