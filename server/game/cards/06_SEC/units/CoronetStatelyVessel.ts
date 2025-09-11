import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class CoronetStatelyVessel extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'coronet#stately-vessel-id',
            internalName: 'coronet#stately-vessel',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly Heroism unit gains Restore 1',
            matchTarget: (card, context) => card !== context.source && card.isUnit(),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
        });
    }
}
