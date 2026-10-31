describe('Saw Gerrera, Shadowlands Insurgent', function() {
    integration(function(contextRef) {
        it('should resource the top card of the deck when the opponent plays an event', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                },
                player2: {
                    groundArena: ['saw-gerrera#shadowlands-insurgent'],
                    deck: ['resupply']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.resupply).toBeInZone('resource', context.player2);
        });

        it('should still resource for owner off of NGOR', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['no-glory-only-results'],
                    deck: ['daring-raid']
                },
                player2: {
                    groundArena: ['saw-gerrera#shadowlands-insurgent'],
                    deck: ['resupply']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.sawGerrera);

            expect(context.player2).toBeActivePlayer();
            expect(context.resupply).toBeInZone('resource', context.player2);
            expect(context.daringRaid).toBeInZone('deck', context.player1);
        });

        it('should still resource for owner off of Tree', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-tree-remembers'],
                },
                player2: {
                    groundArena: ['saw-gerrera#shadowlands-insurgent'],
                    deck: ['resupply']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theTreeRemembers);
            context.player1.clickCard(context.sawGerrera);

            expect(context.player2).toBeActivePlayer();
            expect(context.resupply).toBeInZone('resource', context.player2);
        });

        it('should not resource off friendly event', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-tree-remembers'],
                },
                player2: {
                    hand: ['daring-raid'],
                    groundArena: ['saw-gerrera#shadowlands-insurgent'],
                    deck: ['resupply'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.p1Base);

            expect(context.player1).toBeActivePlayer();
            expect(context.resupply).toBeInZone('deck', context.player2);
        });

        it('should not break if there are no cards in the deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                },
                player2: {
                    groundArena: ['saw-gerrera#shadowlands-insurgent'],
                    deck: []
                }
            });

            const { context } = contextRef;

            const startingResources = context.player1.resources.length;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.resources.length).toBe(startingResources);
            expect(context.p2Base.damage).toBe(2);
        });

        it('should double resource if opponent used L3', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['l337#were-programmed-to-learn']
                },
                player2: {
                    groundArena: ['saw-gerrera#shadowlands-insurgent'],
                    deck: ['resupply', 'vanquish']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('You');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.resupply).toBeInZone('resource', context.player2);
            expect(context.vanquish).toBeInZone('resource', context.player2);
        });
    });
});