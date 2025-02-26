import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class TwiceThePride extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '7439418148',
            internalName: 'twice-the-pride',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to attached unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.source.parentCard
            }))
        });
    }
}
