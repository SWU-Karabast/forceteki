// Scenarios covering engine state-watcher behavior that spans multiple cards.

describe('State watchers', function() {
    integration(function(contextRef) {
        describe('CardsPlayedThisPhaseWatcher when you play an opponent-owned card', function() {
            it('counts an upgrade played from an opponent\'s discard (A Fine Addition) as an upgrade you played this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chewbacca#walking-carpet',
                        base: 'jedha-city',
                        hand: ['a-fine-addition', 'congress-of-malastare', 'on-top-of-things'],
                        groundArena: ['wampa'],
                        resources: 20
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        discard: ['devotion'], // opponent-owned upgrade for A Fine Addition to play
                    }
                });

                const { context } = contextRef;

                // Defeat an enemy unit this phase to enable A Fine Addition
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player2.passAction();

                // Play A Fine Addition to play the opponent's Devotion (owned by player2) from their
                // discard onto a friendly unit. Congress is NOT yet in play, so no cost reduction applies;
                // the play must still be recorded by the CardsPlayedThisPhaseWatcher as played by player1.
                context.player1.clickCard(context.aFineAddition);
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['devotion']);

                context.player2.passAction();

                // Now play Congress of Malastare — its "first Upgrade you play each phase costs 1 less"
                // limit has not been consumed.
                context.player1.clickCard(context.congressOfMalastare);
                expect(context.congressOfMalastare).toBeInZone('groundArena');

                context.player2.passAction();

                // Play a normal upgrade from hand. Because the watcher recorded the A Fine Addition upgrade
                // as an upgrade player1 already played this phase, this is NOT the "first" upgrade and must
                // pay full cost (2). If the opponent-owned card were not captured, it would be discounted to 1.
                const beforeOnTop = context.player1.exhaustedResourceCount;
                context.player1.clickCard(context.onTopOfThings);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['devotion', 'on-top-of-things']);
                const onTopPaid = context.player1.exhaustedResourceCount - beforeOnTop;

                expect(onTopPaid).toBe(2); // full cost — not discounted by Congress
            });
        });
    });
});
