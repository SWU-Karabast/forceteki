import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class BattleFury extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4256802093',
            internalName: 'battle-fury',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addGainOnAttackAbilityTargetingAttached({
            title: 'Discard a card from your hand',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                target: context.player
            }))
        });
    }
}