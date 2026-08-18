import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class ChewbaccaResourcefulWookiee extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'chewbacca#resourceful-wookiee-id',
            internalName: 'chewbacca#resourceful-wookiee',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `This unit gains ${TextHelper.Raid(1)} for each exhausted resource you control`,
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword((target, context) => ({ keyword: KeywordName.Raid, amount: context.player.resources.filter((x) => x.exhausted).length }))
        });

        registrar.addConstantAbility({
            title: `While each resource you control is exhausted, this unit gains ${TextHelper.Overwhelm}`,
            condition: (context) => context.player.resources.every((x) => x.exhausted),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
        });
    }
}