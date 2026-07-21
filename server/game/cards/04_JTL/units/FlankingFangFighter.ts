import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class FlankingFangFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0626954301',
            internalName: 'flanking-fang-fighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `While you control another ${TextHelper.Trait.Fighter} unit, this unit gains ${TextHelper.Raid(2)}`,
            condition: (context) => context.player.isTraitInPlay(Trait.Fighter, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}
