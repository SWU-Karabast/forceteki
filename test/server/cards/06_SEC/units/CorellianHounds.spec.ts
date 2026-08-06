describe('Corellian Hounds', function() {
    integration(function(contextRef) {
        it('Corellian Hounds\'s ability should enter play ready if opponent does not control ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['corellian-hounds'],
                    groundArena: ['atst']
                },
                player2: {
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.corellianHounds);

            expect(context.player2).toBeActivePlayer();
            expect(context.corellianHounds.exhausted).toBeFalse();
        });

        it('Corellian Hounds\'s ability should enter play ready if opponent does not control ground unit (rescue from capture)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                    groundArena: ['atst', 'corellian-hounds']
                },
                player2: {
                    hand: ['discerning-veteran'],
                    spaceArena: ['awing'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.discerningVeteran);
            context.player2.clickCard(context.corellianHounds);

            expect(context.corellianHounds).toBeCapturedBy(context.discerningVeteran);

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.discerningVeteran);

            expect(context.player2).toBeActivePlayer();
            expect(context.player2.groundArenaUnits.length).toBe(0);
            expect(context.corellianHounds.exhausted).toBeFalse();
        });

        it('Corellian Hounds\'s ability should not enter play ready if opponent controls ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['corellian-hounds'],
                    groundArena: ['atst']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.corellianHounds);

            expect(context.player2).toBeActivePlayer();
            expect(context.corellianHounds.exhausted).toBeTrue();
        });

        it('should enter play ready when played from opponent\'s deck via Vermillion when opponent has no ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['vermillion#qiras-auction-house'],
                    groundArena: ['atst']
                },
                player2: {
                    deck: ['corellian-hounds']
                }
            });

            const { context } = contextRef;

            // P1 attacks with Vermillion
            context.player1.clickCard(context.vermillion);
            context.player1.clickCard(context.p2Base);

            // Choose opponent's deck
            context.player1.clickPrompt('Opponent\'s deck');

            // View revealed card
            context.player1.clickDone();

            // Choose yourself to play Corellian Hounds
            context.player1.clickPrompt('You');

            // Choose to play the card for free
            context.player1.clickPrompt('Trigger');

            // Hounds should NOT enter play ready because P1's opponent (P2) has no ground units,
            // but the condition checks context.player.opponent — and context.player should be P1 (the one playing it).
            // P1's opponent (P2) has no ground units, so it SHOULD enter play ready.
            expect(context.corellianHounds).toBeInZone('groundArena', context.player1);
            expect(context.corellianHounds.exhausted).toBeFalse();
        });

        it('should not enter play ready when played from opponent\'s deck via Vermillion and opponent controls ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['vermillion#qiras-auction-house']
                },
                player2: {
                    deck: ['corellian-hounds'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // P1 attacks with Vermillion
            context.player1.clickCard(context.vermillion);
            context.player1.clickCard(context.p2Base);

            // Choose opponent's deck
            context.player1.clickPrompt('Opponent\'s deck');

            // View revealed card
            context.player1.clickDone();

            // Choose yourself to play Corellian Hounds
            context.player1.clickPrompt('You');

            // Choose to play the card for free
            context.player1.clickPrompt('Trigger');

            // Hounds should NOT enter play ready: P1 is the new controller, P1's opponent is P2,
            // and P2 has a ground unit (Wampa). Before the fix, it would incorrectly check
            // the card owner's (P2's) opponent (P1), who has no ground units.
            expect(context.corellianHounds).toBeInZone('groundArena', context.player1);
            expect(context.corellianHounds.exhausted).toBeTrue();
        });
    });
});