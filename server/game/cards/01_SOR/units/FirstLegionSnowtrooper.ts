import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class FirstLegionSnowtrooper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4619930426',
            internalName: 'first-legion-snowtrooper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While attacking a damaged unit, this unit gets +2/+0 and gains Overwhelm.',
            condition: (context) => context.source.isAttacking() && context.source.activeAttack?.targetIsUnit((card) => card.damage > 0),
            ongoingEffect: [AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm), AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })],
        });
    }
}
