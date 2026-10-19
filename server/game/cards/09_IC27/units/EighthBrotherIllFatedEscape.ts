import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Trait, WildcardCardType } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class EighthBrotherIllFatedEscape extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'eighth-brother#illfated-escape-id',
            internalName: '0454689845',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: `Ready an ${TextHelper.Trait.Imperial} unit`,
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Imperial),
                immediateEffect: abilityHelper.immediateEffects.ready()
            }
        });
    }
}