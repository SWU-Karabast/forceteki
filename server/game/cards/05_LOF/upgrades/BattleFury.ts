import AbilityHelper from '../../../AbilityHelper';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class BattleFury extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4256802093',
            internalName: 'battle-fury',
        };
    }

    protected override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addGainOnAttackAbilityTargetingAttached({
            title: 'Discard a card from your hand',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                target: context.player
            }))
        });
    }
}