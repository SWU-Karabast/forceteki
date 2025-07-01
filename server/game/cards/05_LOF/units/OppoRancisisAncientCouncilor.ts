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

    public override setupCardAbilities(card: this) {
        this.addKeywordCopyAbility(KeywordName.Ambush, card);
        this.addKeywordCopyAbility(KeywordName.Grit, card);
        this.addKeywordCopyAbility(KeywordName.Hidden, card);
        this.addKeywordCopyAbility(KeywordName.Overwhelm, card);
        this.addKeywordCopyAbility(KeywordName.Saboteur, card);
        this.addKeywordCopyAbility(KeywordName.Sentinel, card);
        this.addKeywordCopyAbility(KeywordName.Shielded, card);

        card.addConstantAbility({
            title: 'This unit gains Raid 2 while a friendly unit has Raid',
            condition: (context) => context.player.isKeywordInPlay(KeywordName.Raid, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });

        card.addConstantAbility({
            title: 'This unit gains Restore 2 while a friendly unit has Restore',
            condition: (context) => context.player.isKeywordInPlay(KeywordName.Restore, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 })
        });
    }

    private addKeywordCopyAbility(keyword: NonParameterKeywordName, card: this) {
        card.addConstantAbility({
            title: `This unit gains ${KeywordHelpers.keywordDescription(keyword)} while a friendly unit has ${KeywordHelpers.keywordDescription(keyword)}`,
            condition: (context) => context.player.isKeywordInPlay(keyword, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: keyword })
        });
    }
}
