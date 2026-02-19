import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BrokenHornVizagosPride extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'broken-horn#vizagos-pride-id',
            internalName: 'broken-horn#vizagos-pride'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If you have fewer cards in hand than your opponent, draw a card. If you control fewer resources than your opponent, resource the top card of your deck',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.hand.length < context.player.opponent.hand.length,
                    onTrue: AbilityHelper.immediateEffects.draw(),
                }),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.resources.length < context.player.opponent.resources.length,
                    onTrue: AbilityHelper.immediateEffects.resourceCard((context) => ({
                        target: context.player.getTopCardOfDeck()
                    })),
                })
            ])
        });
    }
}