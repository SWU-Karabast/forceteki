import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TheSonEmbodimentOfDarkness extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5460831827',
            internalName: 'the-son#embodiment-of-darkness'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While the Force is with you, each friendly unit gets +2/+0',
            condition: (context) => context.player.hasTheForce,
            matchTarget: (card) => card.isUnit(),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
        });
    }
}