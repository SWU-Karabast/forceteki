import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import type { IPlayableCard } from '../../../core/card/baseClasses/PlayableOrDeployableCard';

export default class OrnFreeTaaPoliticalPowerBroker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4529664083',
            internalName: 'orn-free-taa#political-power-broker',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'This unit gets +1/+0 for each Law card in your discard pile',
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats((_, context) => ({
                power: context.player.discard?.filter((x: IPlayableCard) => x.hasSomeTrait(Trait.Law)).length ?? 0,
                hp: 0,
            }))
        });

        registrar.addWhenPlayedAbility({
            title: 'Search the top 10 cards of your deck for a Law card, reveal it, and draw it',
            immediateEffect: abilityHelper.immediateEffects.deckSearch({
                searchCount: 10,
                cardCondition: (card) => card.hasSomeTrait(Trait.Law),
                selectedCardsImmediateEffect: abilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}
