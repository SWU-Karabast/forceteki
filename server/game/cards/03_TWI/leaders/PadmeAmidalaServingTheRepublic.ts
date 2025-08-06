import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, Trait } from '../../../core/Constants';
import type { GameSystem } from '../../../core/gameSystem/GameSystem';

export default class PadmeAmidalaServingTheRepublic extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2870878795',
            internalName: 'padme-amidala#serving-the-republic',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Action,
            title: 'Search the top 3 cards of your deck for a Republic card, reveal it, and draw it',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityActivationResourceCost(1)],
            immediateEffect: this.buildCoordinateAbilityEffect(AbilityHelper),
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addCoordinateAbility({
            type: AbilityType.Triggered,
            title: 'Search the top 3 cards of your deck for a Republic card, reveal it, and draw it',
            when: {
                onAttack: true,
            },
            immediateEffect: this.buildCoordinateAbilityEffect(AbilityHelper),
        });
    }

    private buildCoordinateAbilityEffect(AbilityHelper: IAbilityHelper): GameSystem<TriggeredAbilityContext<this>> {
        return AbilityHelper.immediateEffects.deckSearch({
            searchCount: 3,
            cardCondition: (card) => card.hasSomeTrait(Trait.Republic),
            selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
        });
    }
}