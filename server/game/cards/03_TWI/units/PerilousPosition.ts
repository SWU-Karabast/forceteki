import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class PerilousPosition extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '8061497086',
            internalName: 'perilous-position'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Exhaust attached unit.',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => ({
                target: context.source.isInPlay() ? context.source.parentCard : null
            }))
        });
    }
}
