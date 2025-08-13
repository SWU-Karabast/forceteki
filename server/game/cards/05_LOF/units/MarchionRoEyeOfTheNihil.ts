import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class MarchionRoEyeOfTheNihil extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4627342747',
            internalName: 'marchion-ro#eye-of-the-nihil',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each friendly unit\'s Raid is doubled.',
            matchTarget: (card, context) => card.isUnit() && card.controller === context.player,
            ongoingEffect: AbilityHelper.ongoingEffects.multiplyNumericKeyword({
                keyword: KeywordName.Raid,
                multiplier: 2
            })
        });
    }
}