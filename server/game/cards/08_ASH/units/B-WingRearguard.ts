import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, ZoneName } from '../../../core/Constants';

export default class BWingRearguard extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6295199019',
            internalName: 'bwing-rearguard',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control a ground unit, this unit gains Sentinel',
            condition: (context) => context.player.hasSomeArenaUnit({ arena: ZoneName.GroundArena }),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}