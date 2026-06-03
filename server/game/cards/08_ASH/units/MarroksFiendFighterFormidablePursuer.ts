import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MarroksFiendFighterFormidablePursuer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'marroks-fiend-fighter#formidable-pursuer-id',
            internalName: 'marroks-fiend-fighter#formidable-pursuer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While attacking a damaged unit, this unit gets +2/+0',
            condition: (context) => context.source.isAttacking() && context.source.activeAttack?.targetIsUnit((card) => card.damage > 0),
            ongoingEffect: [AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })],
        });
    }
}