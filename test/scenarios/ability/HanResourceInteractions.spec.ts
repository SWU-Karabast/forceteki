describe('Han Solo Resource Interaction Scenarios', function() {
    integration(function(contextRef) {
        describe('Han Solo\'s interaction with DJ\'s resource steal ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        base: 'chopper-base',
                        hand: ['pyke-sentinel'],
                        deck: ['liberated-slaves'],
                        resources: [
                            'dj#blatant-thief', 'atst', 'atst', 'atst', 'atst', 'atst'
                        ]
                    },
                    player2: {
                        groundArena: ['moisture-farmer'],
                        resources: ['wampa']
                    }
                });
            });

            it('Han can defeat opponent\'s resource for DJ if Han\'s ability has been used', function() {
                const { context } = contextRef;
                context.player1.clickCard('han-solo#audacious-smuggler');
                context.player1.clickPrompt('Put a card from your hand into play as a resource and ready it. At the start of the next action phase, defeat a resource you control.');
                expect(context.player1.readyResourceCount).toBe(6);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('resource', context.player1);
                expect(context.player1.readyResourceCount).toBe(7);

                // P2 Pass and P1 use DJ
                context.player2.passAction();
                context.player1.clickCard(context.djBlatantThief);
                expect(context.player1.readyResourceCount).toBe(1);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                // Han defeats P2's Wampa and ensure it goes to P2 discard
                expect(context.player1).toHavePrompt('Defeat a resource you control');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player2);
                expect(context.player1.readyResourceCount).toBe(7);
                expect(context.player2.readyResourceCount).toBe(0);
            });
        });

        describe('Han Solo\'s interaction with Millenium Falcon\'s resource payment', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        base: 'chopper-base',
                        hand: ['millennium-falcon#piece-of-junk', 'wampa'],
                        resources: 2
                    }
                });
            });

            it('Han can pay for Falcon with a resource he will defeat for his leader ability', function() {
                const { context } = contextRef;

                // Place Wampa as a resource
                context.player1.clickCard('han-solo#audacious-smuggler');
                expect(context.player1.readyResourceCount).toBe(2);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.player1.readyResourceCount).toBe(3);

                // Play Falcon and Pass
                context.player2.passAction();
                expect(context.millenniumFalcon).toBeInZone('hand', context.player1);
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player1);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                // Han pays for Falcon with Wampa and then defeats it
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player1.clickPrompt('Pay 1 resource');
                expect(context.player1.readyResourceCount).toBe(2);

                expect(context.player1).toHavePrompt('Defeat a resource you control');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player1.readyResourceCount).toBe(2);
            });
        });
    });
});
