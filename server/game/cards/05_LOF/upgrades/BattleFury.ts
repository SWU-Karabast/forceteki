import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class BattleFury extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4256802093',
            internalName: 'battle-fury',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Discard a card from your hand',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                target: context.player
            }))
        });
    }
}