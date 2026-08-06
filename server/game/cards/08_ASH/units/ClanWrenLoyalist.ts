import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class ClanWrenLoyalist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0447040261',
            internalName: 'clan-wren-loyalist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Search the top 5 cards of your deck for a unit that shares a trait with a friendly unit, reveal it, and draw it',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 5,
                cardCondition: (card, context) => card.isUnit() && context.player.isTraitInPlay([...card.traits]),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.revealAndDraw({
                    useDisplayPrompt: true,
                    promptedPlayer: RelativePlayer.Opponent
                })
            })
        });
    }
}