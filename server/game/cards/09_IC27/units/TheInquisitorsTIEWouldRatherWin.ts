import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class TheInquisitorsTIEWouldRatherWin extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-inquisitors-tie#would-rather-win-id',
            internalName: 'the-inquisitors-tie#would-rather-win',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Each player with 4 or more cards in their hand discards a card from their hand',
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOwnHand((c) => ({
                amount: 1,
                target: c.game.getPlayers().filter((p) => p.hand.length >= 4),
            })),
        });
    }
}