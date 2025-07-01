import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Trait } from '../../../core/Constants';

export default class SmugglingCompartment extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7280213969',
            internalName: 'smuggling-compartment',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card: Card) => card.hasSomeTrait(Trait.Vehicle));

        card.addGainOnAttackAbilityTargetingAttached({
            title: 'Ready a resource',
            immediateEffect: AbilityHelper.immediateEffects.readyResources((context) => ({
                target: context.player,
                amount: 1
            }))
        });
    }
}
