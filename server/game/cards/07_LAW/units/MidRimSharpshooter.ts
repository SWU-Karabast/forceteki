import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MidRimSharpshooter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7157450235',
            internalName: 'mid-rim-sharpshooter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Pay 1 to make an opponent to discard a card from their hand',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.payResources((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: {
                title: 'Your opponent discards a card from their hand',
                immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOpponentsHand({ amount: 1 })
            }
        });
    }
}