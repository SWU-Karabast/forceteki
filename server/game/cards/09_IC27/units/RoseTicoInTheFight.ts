import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class RoseTicoInTheFight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'rose-tico#in-the-fight-id',
            internalName: 'rose-tico#in-the-fight',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Give a Shield token to another ${TextHelper.Trait.Resistance} unit`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Resistance),
                immediateEffect: abilityHelper.immediateEffects.giveShield()
            }
        });
    }
}