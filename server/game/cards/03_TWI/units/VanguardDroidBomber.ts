import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class VanguardDroidBomber extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3410014206',
            internalName: 'vanguard-droid-bomber'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to an enemy base.',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: context.source.controller.getOtherUnitsInPlayWithTrait(context.source, Trait.Separatist).length > 0,
                onTrue: AbilityHelper.immediateEffects.damage({ amount: 2, target: context.source.controller.opponent.base }),
                onFalse: AbilityHelper.immediateEffects.noAction()
            }))
        });
    }
}

VanguardDroidBomber.implemented = true;
