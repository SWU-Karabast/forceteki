import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class HiredSlicer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1504187296',
            internalName: 'hired-slicer'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Reveal the top 2 cards of a deck. If you do, exhaust a unit that shares a trait with one of those cards',
            optional: true,
            // Player chooses which deck to reveal from
            targetResolver: {
                mode: TargetMode.Select,
                choices: (context) => ({
                    'Your deck': AbilityHelper.immediateEffects.reveal(() => ({
                        target: context.player.getTopCardsOfDeck(2)
                    })),
                    'Opponent\'s deck': AbilityHelper.immediateEffects.reveal(() => ({
                        target: context.player.opponent.getTopCardsOfDeck(2)
                    }))
                })
            },
            ifYouDo: (ifYouDoContext) => {
                const revealedCards = ifYouDoContext.events[0].cards;

                // Collect all unique traits from the revealed cards
                const revealedTraits = new Set<string>();
                for (const revealedCard of revealedCards) {
                    for (const trait of revealedCard.traits) {
                        revealedTraits.add(trait);
                    }
                }

                return {
                    title: 'Exhaust a unit that shares a trait with one of those cards',
                    optional: true,
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        // Target must share at least one trait with the revealed cards
                        cardCondition: (card) => Array.from(card.traits).some((trait: string) => revealedTraits.has(trait)),
                        immediateEffect: AbilityHelper.immediateEffects.exhaust()
                    },
                    then: {
                        title: 'Put those cards on the bottom of that deck in a random order',
                        immediateEffect: AbilityHelper.immediateEffects.moveToBottomOfDeck(() => ({
                            target: revealedCards,
                            shuffleMovedCards: true
                        }))
                    }
                };
            }
        });
    }
}