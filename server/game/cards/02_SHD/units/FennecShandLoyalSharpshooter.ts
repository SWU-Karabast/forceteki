import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class FennecShandLoyalSharpshooter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7982524453',
            internalName: 'fennec-shand#loyal-sharpshooter'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to the defender (if it\'s a unit) for each different cost among cards in your discard pile',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.attack.targetIsUnit(),
                onTrue: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: new Set(context.player.discard.map((card) => card.cost)).size,
                    target: context.event.attack.getAllTargets(),
                })),
            })
        });
    }
}
