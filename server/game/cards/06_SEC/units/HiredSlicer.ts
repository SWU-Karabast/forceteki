import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';

export default class HiredSlicer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1504187296',
            internalName: 'hired-slicer'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Reveal the top 2 cards of a deck',
            optional: true,
            targetResolver: {
                mode: TargetMode.Select,
                choosingPlayer: RelativePlayer.Self,
                choices: (context) => ({
                    'Your deck': AbilityHelper.immediateEffects.reveal(() => ({
                        target: context.player.getTopCardsOfDeck(2)
                    })),
                    'Opponent\'s deck': AbilityHelper.immediateEffects.reveal(() => ({
                        target: context.player.opponent.getTopCardsOfDeck(2)
                    }))
                })
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Exhaust a unit that shares a trait with one of those cards',
                thenCondition: () => {
                    const revealedCards = ifYouDoContext.events[0].cards || [];
                    return revealedCards.length > 0;
                },
                targetResolver: {
                    optional: true,
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card) => {
                        const revealedCards = ifYouDoContext.events[0].cards || [];
                        return this.cardSharesTraitWithRevealedCards(card, revealedCards);
                    },
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                },
                then: {
                    title: 'Put those cards on the bottom of that deck in a random order',
                    immediateEffect: AbilityHelper.immediateEffects.handler({
                        handler: () => {
                            const revealedCards = ifYouDoContext.events[0].cards || [];
                            if (revealedCards.length === 0) {
                                return;
                            }

                            // Determine which deck to put them back to
                            const targetDeck = revealedCards[0].controller.drawDeck;

                            // Remove the revealed cards from the top of the deck
                            const cardsToMove = targetDeck.splice(0, revealedCards.length);

                            // Randomize order (Fisher-Yates shuffle)
                            for (let i = cardsToMove.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [cardsToMove[i], cardsToMove[j]] = [cardsToMove[j], cardsToMove[i]];
                            }

                            // Put on bottom of deck
                            targetDeck.push(...cardsToMove);
                        }
                    })
                }
            })
        });
    }

    private cardSharesTraitWithRevealedCards(card: Card, revealedCards: Card[]): boolean {
        if (revealedCards.length === 0) {
            return false;
        }

        // Collect all traits from revealed cards
        const revealedTraits = new Set<string>();
        for (const revealedCard of revealedCards) {
            for (const trait of revealedCard.traits) {
                revealedTraits.add(trait);
            }
        }

        // Check if the card has any trait in common
        // Convert Set to Array to use .some()
        return Array.from(card.traits).some((trait: string) => revealedTraits.has(trait));
    }
}