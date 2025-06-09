import AbilityHelper from '../../../AbilityHelper';
import * as KeywordHelpers from '../../../core/ability/KeywordHelpers';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import type { NonParameterKeywordName } from '../../../Interfaces';

export default class OppoRancisisAncientCouncilor extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2370458497',
            internalName: 'oppo-rancisis#ancient-councilor'
        };
    }

    public override setupCardAbilities() {
        this.addKeywordCopyAbility(KeywordName.Ambush);
        this.addKeywordCopyAbility(KeywordName.Grit);
        this.addKeywordCopyAbility(KeywordName.Hidden);
        this.addKeywordCopyAbility(KeywordName.Overwhelm);
        this.addKeywordCopyAbility(KeywordName.Saboteur);
        this.addKeywordCopyAbility(KeywordName.Sentinel);
        this.addKeywordCopyAbility(KeywordName.Shielded);

        this.addConstantAbility({
            title: 'This unit gains Raid 2 while a friendly unit has Raid',
            condition: (context) => context.player.isKeywordInPlay(KeywordName.Raid, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });

        this.addConstantAbility({
            title: 'This unit gains Restore 2 while a friendly unit has Restore',
            condition: (context) => context.player.isKeywordInPlay(KeywordName.Restore, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 })
        });
    }

    private addKeywordCopyAbility(keyword: NonParameterKeywordName) {
        this.addConstantAbility({
            title: `This unit gains ${KeywordHelpers.keywordDescription(keyword)} while a friendly unit has ${keyword}`,
            condition: (context) => context.player.isKeywordInPlay(keyword, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: keyword })
        });
    }
}
