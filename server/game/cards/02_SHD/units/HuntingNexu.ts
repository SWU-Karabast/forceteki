import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName } from '../../../core/Constants';

export default class HuntingNexu extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8991513192',
            internalName: 'hunting-nexu'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While you control another Aggression unit, this unit gains Raid 2',
            condition: (context) => context.player.isAspectInPlay(Aspect.Aggression, context.source),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 })
        });
    }
}
