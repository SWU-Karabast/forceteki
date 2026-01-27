import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class _4LOMDevious extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8950998844',
            internalName: '4lom#devious'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with a friendly Bounty Hunter unit, even if it\'s exhausted. It can\'t attack bases for this attack.',
            optional: true,
            initiateAttack: {
                attackerCondition: (card) => card.hasSomeTrait(Trait.BountyHunter),
                targetCondition: (target) => target.isUnit(),
                allowExhaustedAttacker: true
            }
        });
    }
}