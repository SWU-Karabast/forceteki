import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class CoronetStatelyVessel extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7898942239',
            internalName: 'coronet#stately-vessel',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Each other friendly ${TextHelper.aspects(Aspect.Heroism)} unit gains Restore 1`,
            matchTarget: (card, context) => card !== context.source && card.isUnit(),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
        });
    }
}
