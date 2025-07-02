import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class Imprisoned extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1368144544',
            internalName: 'imprisoned',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setAttachCondition((card) => card.isNonLeaderUnit());

        card.addConstantAbilityTargetingAttached({
            title: 'Attached unit loses its current abilities and can\'t gain abilities',
            ongoingEffect: AbilityHelper.ongoingEffects.loseAllAbilities()
        });
    }
}
