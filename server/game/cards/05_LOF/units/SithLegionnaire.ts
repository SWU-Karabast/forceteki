import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';

export default class SithLegionnaire extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4082337781',
            internalName: 'sith-legionnaire'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control another Villainy unit, this unit gets +2/+0',
            condition: (context) => context.player.hasSomeArenaUnit({
                aspect: Aspect.Villainy,
                otherThan: context.source
            }),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
