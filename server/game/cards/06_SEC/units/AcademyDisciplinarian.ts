import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AcademyDisciplinarian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'academy-disciplinarian-id',
            internalName: 'academy-disciplinarian',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 1 damage to a friendly unit with 2 or less power and ready it',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.isUnit() && card.getPower() <= 2,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.damage({ amount: 1 }),
                    abilityHelper.immediateEffects.ready()
                ])
            }
        });
    }
}
