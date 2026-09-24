import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class AdmiralHoldoWeAreTheSpark extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'admiral-holdo#we-are-the-spark-id',
            internalName: 'admiral-holdo#we-are-the-spark',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Draw 1 more card during the regroup phase',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyCardsDrawnInDrawPhase(3),
        });
    }
}