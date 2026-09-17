import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class V19Skirmisher extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2814980803',
            internalName: 'v19-skirmisher',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control 3 or more units, this unit gains ${TextHelper.Sentinel}`,
            condition: (context) => context.player.getArenaUnits().length >= 3,
            matchTarget: (card, context) => card === context.source,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
