import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class JediVector extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'jedi-vector-id',
            internalName: 'jedi-vector'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control another Jedi unit, this unit gets +1/+0',
            condition: (context) => context.player.hasSomeArenaUnit({ otherThan: context.source, trait: Trait.Jedi }),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
        });

        registrar.addConstantAbility({
            title: 'While you control a Lightsaber upgrade, this unit gets +1/+0',
            condition: (context) => context.player.hasSomeArenaUpgrade({ trait: Trait.Lightsaber }),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
        });
    }
}