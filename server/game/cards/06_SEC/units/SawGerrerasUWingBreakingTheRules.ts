import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

export default class SawGerrerasUWingBreakingTheRules extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'saw-gerreras-uwing#breaking-the-rules-id',
            internalName: 'saw-gerreras-uwing#breaking-the-rules',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addOnAttackCompletedAbility({
            title: 'Attack with another Aggression unit',
            optional: true,
            initiateAttack: {
                attackerCondition: (card, context) => card !== context.source && card.hasSomeAspect(Aspect.Aggression)
            }
        });
    }
}