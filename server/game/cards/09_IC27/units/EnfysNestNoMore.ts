import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

// While attacking a unit that costs 3 or less, this unit gets +2/+0 and gains Overwhelm.

export default class EnfysNestNoMore extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6849688480',
            internalName: 'enfys-nest#no-more',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While attacking a unit that costs 3 or less, this unit gets +2/+0 and gains ${TextHelper.Overwhelm}`,
            condition: (context) => context.source.isAttacking() && context.source.activeAttack?.targetIsUnit((card) => card.cost <= 3, true),
            ongoingEffect: [
                abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
            ]
        });
    }
}
