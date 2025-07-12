import type { IAbilityHelper } from '../../../AbilityHelper';
import * as KeywordHelpers from '../../../core/ability/KeywordHelpers';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
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

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        this.addKeywordCopyAbility(registrar, AbilityHelper, KeywordName.Ambush);
        this.addKeywordCopyAbility(registrar, AbilityHelper, KeywordName.Grit);
        this.addKeywordCopyAbility(registrar, AbilityHelper, KeywordName.Hidden);
        this.addKeywordCopyAbility(registrar, AbilityHelper, KeywordName.Overwhelm);
        this.addKeywordCopyAbility(registrar, AbilityHelper, KeywordName.Saboteur);
        this.addKeywordCopyAbility(registrar, AbilityHelper, KeywordName.Sentinel);
        this.addKeywordCopyAbility(registrar, AbilityHelper, KeywordName.Shielded);

        registrar.addConstantAbility({
            title: 'This unit gains Raid 2 while a friendly unit has Raid',
            condition: (context) => context.player.isKeywordInPlay(KeywordName.Raid, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });

        registrar.addConstantAbility({
            title: 'This unit gains Restore 2 while a friendly unit has Restore',
            condition: (context) => context.player.isKeywordInPlay(KeywordName.Restore, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 2 })
        });
    }

    private addKeywordCopyAbility(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper, keyword: NonParameterKeywordName) {
        registrar.addConstantAbility({
            title: `This unit gains ${KeywordHelpers.keywordDescription(keyword)} while a friendly unit has ${KeywordHelpers.keywordDescription(keyword)}`,
            condition: (context) => context.player.isKeywordInPlay(keyword, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: keyword })
        });
    }
}
