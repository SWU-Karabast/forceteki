import AbilityHelper from '../../AbilityHelper';
import { AbilityContext } from '../../core/ability/AbilityContext';
import { Attack } from '../../core/attack/Attack';
import { UpgradeCard } from '../../core/card/UpgradeCard';
import { Trait } from '../../core/Constants';

export default class Entrenched extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3099663280',
            internalName: 'entrenched',
        };
    }

    public override setupCardAbilities() {
        this.addAttachedUnitEffectAbility({
            title: 'Attached unit cannot attack bases',
            ongoingEffect: AbilityHelper.ongoingEffects.cannotAttackBase(),
        });
    }
}

Entrenched.implemented = true;
