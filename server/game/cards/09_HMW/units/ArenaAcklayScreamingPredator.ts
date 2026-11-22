import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ArenaAcklayScreamingPredator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3800014209',
            internalName: 'arena-acklay#screaming-predator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 2 damage to each enemy base',
            when: {
                onDamageDealt: (event, context) =>
                    !event.willDefeat &&
                    event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 2,
                target: context.player.opponent.base
            }))
        });
    }
}