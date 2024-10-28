import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class FennecShandLoyalSharpshooter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7982524453',
            internalName: 'fennec-shand#loyal-sharpshooter'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Deal 1 damage to the defender (if it\'s a unit) for each different cost among cards in your discard pile',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.event.attack.target.isUnit(),
                onTrue: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: new Set(context.source.controller.discard.map((card) => card.cost)).size,
                    target: context.event.attack.target,
                })),
                onFalse: AbilityHelper.immediateEffects.noAction(),
            })
        });
    }
}

FennecShandLoyalSharpshooter.implemented = true;
