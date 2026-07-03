import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class AnakinSkywalkerDestinedForDarkness extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'anakin-skywalker#destined-for-darkness-id',
            internalName: 'anakin-skywalker#destined-for-darkness',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'When Defeated: Search your deck for a card named Darth Vader, reveal it, and draw it',
            immediateEffect: abilityHelper.immediateEffects.deckSearch({
                searchWholeDeck: true,
                cardCondition: (card) => card.title === 'Darth Vader',
                selectedCardsImmediateEffect: abilityHelper.immediateEffects.revealAndDraw({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })
            })
        });

        registrar.addConstantAbility({
            title: 'Ignore the aspect penalties on cards you play named Darth Vader',
            sourceZoneFilter: ZoneName.Discard,
            ongoingEffect: abilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                cardTypeFilter: WildcardCardType.Playable,
                match: (card) => card.title === 'Darth Vader',
            })
        });
    }
}