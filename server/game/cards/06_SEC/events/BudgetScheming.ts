import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { CardType, TargetMode, Trait } from '../../../core/Constants';

export default class BudgetScheming extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3489636326',
            internalName: 'budget-scheming',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give an Experience token to up to 3 Official units',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardTypeFilter: CardType.BasicUnit || CardType.LeaderUnit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Official),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}