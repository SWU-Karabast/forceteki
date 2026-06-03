import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HeroicPurrgil extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'heroic-purrgil-id',
            internalName: 'heroic-purrgil',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While attacking with Ambush, this unit gets +2/+0',
            condition: (context) => context.source.isAttacking() && context.source.activeAttack?.isAmbush,
            ongoingEffect: [AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })],
        });
    }
}