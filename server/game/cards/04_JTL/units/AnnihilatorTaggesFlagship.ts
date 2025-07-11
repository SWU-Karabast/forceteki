import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class AnnihilatorTaggesFlagship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8582806124',
            internalName: 'annihilator#tagges-flagship'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Defeat an enemy unit',
            optional: true,
            when: {
                whenPlayed: true,
                whenDefeated: true
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: `Discard all cards named ${this.getTargetTitle(ifYouDoContext)} from the opponent's hand and deck`,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.conditional({
                        condition: ifYouDoContext.player.opponent.hand.length > 0,
                        onTrue: AbilityHelper.immediateEffects.sequential((context) => {
                            const matchingCardNames = context.player.opponent.hand.filter((card) => card.title === this.getTargetTitle(ifYouDoContext));
                            return [
                                AbilityHelper.immediateEffects.lookAt((context) => ({
                                    target: context.player.opponent.hand,
                                    useDisplayPrompt: true
                                })),
                                AbilityHelper.immediateEffects.simultaneous(
                                    matchingCardNames.map((target) =>
                                        AbilityHelper.immediateEffects.discardSpecificCard({
                                            target: target
                                        })
                                    )
                                )
                            ];
                        }),
                    }),
                    AbilityHelper.immediateEffects.entireDeckSearch({
                        cardCondition: (card) => card.title === this.getTargetTitle(ifYouDoContext),
                        selectedCardsImmediateEffect: AbilityHelper.immediateEffects.discardSpecificCard(),
                        shuffleWhenDone: true,
                        targetMode: TargetMode.Unlimited,
                        activePromptTitle: `Select which cards named ${this.getTargetTitle(ifYouDoContext)} to discard from the opponent's deck`,
                        player: ifYouDoContext.player.opponent,
                        choosingPlayer: ifYouDoContext.player
                    })
                ])
            })
        });
    }

    private getTargetTitle(context: AbilityContext): string {
        return context.events.find((event) => event.name === EventName.OnCardDefeated)?.lastKnownInformation?.title ?? context.target.title;
    }
}