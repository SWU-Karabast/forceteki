describe('Rose Tico, Now It\'s Worth It', function () {
    integration(function (contextRef) {
        it('should enter play ready when controlling a non-unique unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rose-tico#now-its-worth-it'],
                    groundArena: ['battlefield-marine', 'luke-skywalker#jedi-knight']
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico.exhausted).toBeFalse();
        });

        it('should not enter play ready when not controlling a non-unique unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rose-tico#now-its-worth-it'],
                    groundArena: ['luke-skywalker#jedi-knight'] // unique
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico.exhausted).toBeTrue();
        });

        it('should not enter play ready when controlling no units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rose-tico#now-its-worth-it']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico.exhausted).toBeTrue();
        });

        it('should enter play ready with non-unique space unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rose-tico#now-its-worth-it'],
                    spaceArena: ['cartel-spacer'] // non-unique space unit
                },
                player2: {}
            });

            const { context } = contextRef;

            context.player1.clickCard(context.roseTico);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico.exhausted).toBeFalse();
        });

        it('should enter play ready after being rescued', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                    groundArena: ['rose-tico#now-its-worth-it', 'battlefield-marine'],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['discerning-veteran']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.discerningVeteran);
            context.player2.clickCard(context.roseTico);

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.discerningVeteran);

            expect(context.player2).toBeActivePlayer();
            expect(context.roseTico).toBeInZone('groundArena', context.player1);
            expect(context.roseTico.exhausted).toBeFalse();
        });

        it('should not enter play ready when played from opponent\'s deck via Vermillion and the player has no non-unique units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['vermillion#qiras-auction-house']
                },
                player2: {
                    deck: ['rose-tico#now-its-worth-it'],
                    groundArena: ['crafty-smuggler']
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

            // Choose yourself to play Rose Tico
            context.player1.clickPrompt('You');

            // Choose to play the card for free
            context.player1.clickPrompt('Trigger');

            // Rose should NOT enter play ready because P1 does not control any non-unique units
            expect(context.roseTico).toBeInZone('groundArena', context.player1);
            expect(context.roseTico.exhausted).toBeTrue();
        });

        it('should enter play ready when played from opponent\'s deck via Vermillion and the player has a non-unique unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['vermillion#qiras-auction-house'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    deck: ['rose-tico#now-its-worth-it'],
                    groundArena: ['crafty-smuggler']
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

            // Choose yourself to play Rose Tico
            context.player1.clickPrompt('You');

            // Choose to play the card for free
            context.player1.clickPrompt('Trigger');

            // Rose SHOULD enter play ready because P1 controls a non-unique unit (Battlefield Marine)
            expect(context.roseTico).toBeInZone('groundArena', context.player1);
            expect(context.roseTico.exhausted).toBeFalse();
        });
    });
});
