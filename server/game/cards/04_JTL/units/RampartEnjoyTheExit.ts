import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityRestriction } from '../../../core/Constants';

export default class RampartEnjoyTheExit extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9720757803',
            internalName: 'rampart#enjoy-the-exit',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit doesn\'t ready during the regroup phase unless its power is 4 or more',
            condition: (context) => context.source.getPower() < 4,
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.DoesNotReadyDuringRegroup),
        });
    }
}
