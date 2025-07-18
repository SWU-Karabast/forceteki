import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { CardType, Trait } from '../../../core/Constants';

export default class JabbaTheHuttCunningDaimyo extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5035052619',
            internalName: 'jabba-the-hutt#cunning-daimyo',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each Trick event you play costs 1 resource less',
            ongoingEffect: AbilityHelper.ongoingEffects.decreaseCost({
                amount: 1,
                cardTypeFilter: CardType.Event,
                match: (card) => card.hasSomeTrait(Trait.Trick)
            })
        });

        registrar.addWhenPlayedAbility({
            title: 'Search the top 8 cards of your deck for a Trick event, reveal it, and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 8,
                cardCondition: (card) => card.isEvent() && card.hasSomeTrait(Trait.Trick),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}
