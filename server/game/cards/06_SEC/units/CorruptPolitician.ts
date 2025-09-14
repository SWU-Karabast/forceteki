import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class CorruptPolitician extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8854921497',
            internalName: 'corrupt-politician',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control more units than an opponent, this unit gains Sentinel',
            condition: (context) => context.player.getArenaUnits().length > context.player.opponent.getArenaUnits().length,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}
