import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class ObiWanKenobiSteadfastKnight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8997739660',
            internalName: 'obiwan-kenobi#steadfast-knight',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Other friendly Republic units gain Restore 1',
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeTrait(Trait.Republic),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
        });
    }
}