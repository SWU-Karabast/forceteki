import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class HothLieutenant extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4512477799',
            internalName: 'hoth-lieutenant',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with a unit',
            optional: true,
            initiateAttack: {
                attackerCondition: (card, context) => card !== context.source,
                attackerLastingEffects: {
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                }
            }
        });
    }
}