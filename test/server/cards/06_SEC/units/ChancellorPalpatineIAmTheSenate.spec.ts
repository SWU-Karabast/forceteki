describe('Chancellor Palpatine, I Am The Senate', function() {
    integration(function(contextRef) {
        it('when played while you control a leader unit, creates 2 Spy tokens and gives those tokens Sentinel for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                    hand: ['chancellor-palpatine#i-am-the-senate'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Play Palpatine unit
            context.player1.clickCard(context.chancellorPalpatineIAmTheSenate);

            // Verify 2 Spy tokens were created for player1
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(2);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();

            // Now it is player2's action; attempting to attack must target a Sentinel (the spies) due to the phase effect
            context.player2.clickCard(context.wampa);
            // Only the spies should be valid defenders because they have Sentinel for this phase
            expect(context.player2).toBeAbleToSelectExactly(spies);
            context.player2.clickCard(spies[0]);
        });

        it('when played while you control an undeployed leader, does not create tokens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'iden-versio#inferno-squad-commander',
                    hand: ['chancellor-palpatine#i-am-the-senate'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.chancellorPalpatineIAmTheSenate);

            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(0);

            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.chancellorPalpatine]);
            context.player2.clickCard(context.p1Base);
        });

        it('can be played from resources using Plot when a leader is deployed; creates 2 Spies with Sentinel and replaces itself from the deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'iden-versio#inferno-squad-commander',
                    resources: ['chancellor-palpatine#i-am-the-senate', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                    deck: ['pyke-sentinel'],
                    base: 'echo-base'
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            // Deploy leader to open Plot window
            context.player1.clickCard(context.idenVersio);
            context.player1.clickPrompt('Deploy Iden Versio');
            context.player1.clickPrompt('Shielded');

            // Expect Plot prompt for Palpatine
            expect(context.player1).toHavePassAbilityPrompt('Play Chancellor Palpatine using Plot');
            context.player1.clickPrompt('Trigger');

            // Palpatine should be in ground and replacement card should go to resources
            expect(context.chancellorPalpatineIAmTheSenate).toBeInZone('groundArena');
            expect(context.pykeSentinel).toBeInZone('resource');

            // Verify 2 Spy tokens were created and have effect this phase
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(2);
            expect(spies).toAllBeInZone('groundArena');
            expect(spies.every((spy) => spy.exhausted)).toBeTrue();

            // Opponent must attack a Sentinel this phase
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly(spies);
            // Resolve the attack selection to avoid unresolved prompt
            context.player2.clickCard(spies[0]);
        });
    });
});
