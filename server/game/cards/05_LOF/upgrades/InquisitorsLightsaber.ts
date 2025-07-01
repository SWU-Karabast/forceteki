import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class InquisitorsLightsaber extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3895004077',
            internalName: 'inquisitors-lightsaber',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isUnit() && !card.hasSomeTrait(Trait.Vehicle));

        card.addConstantAbilityTargetingAttached({
            title: 'While attacking a Force unit, this unit gets +2/+0.',
            condition: (context) => context.source.parentCard.isAttacking() && context.source.parentCard.activeAttack?.targetIsUnit((card) => card.hasSomeTrait(Trait.Force), true),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}