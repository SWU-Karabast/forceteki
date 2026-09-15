import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { CardType, WildcardCardType } from '../../../core/Constants';

export default class DookuCorruptionMustBeEradicated extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'dooku#corruption-must-be-eradicated-id',
            internalName: 'dooku#corruption-must-be-eradicated',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Ready another unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.ready()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `Heal ${ifYouDoContext.target.cost} damage from a base`,
                targetResolver: {
                    cardTypeFilter: CardType.Base,
                    immediateEffect: abilityHelper.immediateEffects.heal({ amount: ifYouDoContext.target.cost })
                }
            })
        });
    }
}