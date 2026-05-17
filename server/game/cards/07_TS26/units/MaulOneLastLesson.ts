import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MaulOneLastLesson extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0211565206',
            internalName: 'maul#one-last-lesson',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with another unit',
            optional: true,
            initiateAttack: {
                attackerCondition: (card, context) => card !== context.source
            }
        });
    }
}