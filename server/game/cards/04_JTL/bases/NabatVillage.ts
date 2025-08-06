import type { IAbilityHelper } from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import { GameStateChangeRequired, PhaseName, RelativePlayer, TargetMode, ZoneName } from '../../../core/Constants';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class NabatVillage extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '9586661707',
            internalName: 'nabat-village',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Draw 3 more cards in your starting hand',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStartingHandSize({
                amount: 3
            })
        });

        registrar.addConstantAbility({
            title: 'Player cannot mulligan',
            ongoingEffect: AbilityHelper.ongoingEffects.noMulligan()
        });

        registrar.addTriggeredAbility({
            title: 'Put 3 cards from your hand on the bottom of your deck',
            when: {
                onPhaseStarted: (event) => event.phase === PhaseName.Action && event.context.game.roundNumber === 1
            },
            immediateEffect: AbilityHelper.immediateEffects.selectCard({
                activePromptTitle: 'Select 3 cards',
                mode: TargetMode.Exactly,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                numCards: 3,
                mustChangeGameState: GameStateChangeRequired.MustFullyResolve,
                effect: 'choose 3 cards to move to the bottom of their deck',
                immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck()
            })
        });
    }
}

