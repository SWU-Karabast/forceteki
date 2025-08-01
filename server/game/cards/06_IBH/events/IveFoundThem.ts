import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Player } from '../../../core/Player';
import type { IPlayableCard } from '../../../core/card/baseClasses/PlayableOrDeployableCard';

export default class IveFoundThem extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6605408513',
            internalName: 'ive-found-them',
        };
    }

    private getTopCardsOfDeckSafely(player: Player, count: number): IPlayableCard[] {
        if (player.drawDeck.length === 0) {
            return [];
        }

        return player.getTopCardsOfDeck(Math.min(count, player.drawDeck.length));
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Reveal the top 3 cards of your deck. Draw a unit revealed this way, then discard the other revealed cards',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => {
                const topCards = this.getTopCardsOfDeckSafely(context.player, 3);
                const hasUnits = topCards.some((card) => card.isUnit());

                return {
                    condition: topCards.length > 0,
                    onTrue: AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.revealAndSelectCard(({
                            activePromptTitle: 'Choose a unit to draw',
                            target: topCards,
                            cardCondition: (card) => card.isUnit(),
                            canChooseFewer: false,
                            immediateEffect: AbilityHelper.immediateEffects.sequential([
                                AbilityHelper.immediateEffects.drawSpecificCard(),
                                AbilityHelper.immediateEffects.discardSpecificCard((context) => ({
                                    target: this.getTopCardsOfDeckSafely(context.player, 2)
                                })),
                            ]),
                            useDisplayPrompt: true
                        })),
                        AbilityHelper.immediateEffects.conditional({
                            condition: !hasUnits,
                            onTrue: AbilityHelper.immediateEffects.discardSpecificCard({
                                target: topCards
                            })
                        })
                    ])
                };
            })
        });
    }
}
