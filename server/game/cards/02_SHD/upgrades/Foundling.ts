import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { EffectName, RelativePlayer } from '../../../core/Constants';
import { OngoingEffectBuilder } from '../../../core/ongoingEffect/OngoingEffectBuilder';

export default class Foundling extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7687006104',
            internalName: 'foundling',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'Give Mandalorian\'s trait to the attached card',
            condition: () => true,
            matchTarget: (card, context) => card === context.source.parentCard,
            targetController: RelativePlayer.Any,
            ongoingEffect: OngoingEffectBuilder.card.static(EffectName.AddTrait, 'mandalorian'),
        });
    }
}

Foundling.implemented = true;
