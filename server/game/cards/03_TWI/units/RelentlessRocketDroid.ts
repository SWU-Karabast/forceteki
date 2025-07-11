import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class RelentlessRocketDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1368135704',
            internalName: 'relentless-rocket-droid'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While you control another Trooper unit, this unit gets +2/+0.',
            condition: (context) => context.player.hasSomeArenaUnit({ otherThan: context.source, trait: Trait.Trooper }),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
