import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class MotherTalzinPledgedToTheSisterhood extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'mother-talzin#pledged-to-the-sisterhood-id',
            internalName: 'mother-talzin#pledged-to-the-sisterhood',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Each other friendly unit gains ${TextHelper.Restore(1)}`,
            matchTarget: (card, context) => card !== context.source && card.isUnit(),
            ongoingEffect: abilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Restore, amount: 1 })
        });
    }
}