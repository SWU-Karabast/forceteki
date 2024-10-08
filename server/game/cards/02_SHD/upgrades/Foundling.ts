import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { EffectName, Trait } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class Foundling extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7687006104',
            internalName: 'foundling',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbilityTargetingAttached({
            title: 'Give the Mandalorian trait to the attached card',
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.AddTrait, Trait.Mandalorian),
        });
    }
}

Foundling.implemented = true;
