import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class FlankingFangFighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0626954301',
            internalName: 'flanking-fang-fighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While you control another Fighter unit, this unit gains Raid 2',
            condition: (context) => context.player.isTraitInPlay(Trait.Fighter, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}
