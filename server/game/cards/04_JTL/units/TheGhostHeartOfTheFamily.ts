import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EffectName, KeywordName, Trait } from '../../../core/Constants';

export default class TheGhostHeartOfTheFamily extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5763330426',
            internalName: 'the-ghost#heart-of-the-family'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly Spectre unit gains this unit\'s keywords',
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeTrait(Trait.Spectre),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeywords((target, context) => {
                const blankedKeywords = context.source.getOngoingEffectValues(EffectName.LoseKeyword);
                return context.source.getOngoingEffectValues(EffectName.GainKeyword)
                    .filter((keywordProps) => !blankedKeywords.includes(keywordProps.keyword));
            })
        });

        registrar.addConstantAbility({
            title: 'Gain sentinel while upgraded',
            condition: (context) => context.source.isUpgraded(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}