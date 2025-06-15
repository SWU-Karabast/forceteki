import AbilityHelper from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AnnihilatorTaggesFlagship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8582806124',
            internalName: 'annihilator#tagges-flagship'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
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
                    AbilityHelper.immediateEffects.conditional((context) => {
                        const opponentDeck = context.player.opponent.drawDeck;
                        return {
                            condition: opponentDeck.length > 0,
                            onTrue: AbilityHelper.immediateEffects.simultaneous(() => {
                                const matchingCardNames = opponentDeck.filter((card) => card.title === this.getTargetTitle(ifYouDoContext));
                                return matchingCardNames.map((target) =>
                                    AbilityHelper.immediateEffects.discardSpecificCard({
                                        target: target
                                    })
                                );
                            }),
                        };
                    })
                ])
            })
        });
    }

    private getTargetTitle(context: AbilityContext): string {
        return context.events.find((event) => event.name === EventName.OnCardDefeated)?.lastKnownInformation?.title ?? context.target.title;
    }
}