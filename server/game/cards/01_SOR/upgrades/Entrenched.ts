import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Entrenched extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3099663280',
            internalName: 'entrenched',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbilityTargetingAttached({
            title: 'Attached unit cannot attack bases',
            ongoingEffect: AbilityHelper.ongoingEffects.cannotAttackBase(),
        });
    }
}
