import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName } from '../../../core/Constants';

export default class RedThreeUnstoppable extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8995892693',
            internalName: 'red-three#unstoppable',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly Heroism unit gains Raid 1',
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeAspect(Aspect.Heroism),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });
    }
}
