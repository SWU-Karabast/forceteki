import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class JediTrials extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0545149763',
            internalName: 'jedi-trials',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Force));

        card.addGainOnAttackAbilityTargetingAttached({
            title: 'Give an Experience token to this unit',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience()
        });

        card.addConstantAbilityTargetingAttached({
            title: 'While attached unit has 4 or more upgrades on it, it gains the Jedi trait',
            condition: (context) => context.source.parentCard.upgrades.length >= 4,
            ongoingEffect: AbilityHelper.ongoingEffects.gainTrait(Trait.Jedi)
        });
    }
}