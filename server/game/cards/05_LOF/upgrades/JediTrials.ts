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

    public override setupCardAbilities() {
        this.setAttachCondition((card) => card.isUnit() && card.hasSomeTrait(Trait.Force));

        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Give an Experience token to this unit',
            immediateEffect: AbilityHelper.immediateEffects.giveExperience()
        });

        this.addConstantAbilityTargetingAttached({
            title: ' While attached unit has 4 or more upgrades on it, it gains the Jedi trait',
            condition: (context) => context.source.parentCard.upgrades.length >= 4,
            ongoingEffect: AbilityHelper.ongoingEffects.gainTrait(Trait.Jedi)
        });
    }
}