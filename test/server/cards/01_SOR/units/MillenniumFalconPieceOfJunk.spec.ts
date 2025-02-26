describe('Millennium Falcon, Piece of Junk', function () {
    integration(function (contextRef) {
        describe('Millennium Falcon\'s ability', function () {
            it('should enter ready and on regroup phase should have to pay 1 resource or return unit in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['millennium-falcon#piece-of-junk'],
                    },
                });

                const { context } = contextRef;

                // play millennium falcon, should be ready
                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                expect(context.millenniumFalcon.exhausted).toBeFalse();
                expect(context.millenniumFalcon).toBeInZone('spaceArena');

                // attack with falcon
                context.player1.clickCard(context.millenniumFalcon);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);

                // go to regroup phase
                context.player2.passAction();
                context.player1.passAction();

                // skip ramp
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // should pay 1 resource or return falcon in hand
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player1.clickPrompt('Pay 1 resource');

                // we paid 1 resource, unit still in arena and can attack
                expect(context.player1).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player1.clickCard(context.millenniumFalcon);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);

                // go to regroup phase
                context.player2.passAction();
                context.player1.passAction();

                // skip ramp
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // return falcon to hand
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player1.clickPrompt('Return this unit to her owner\'s hand');

                expect(context.player1).toBeActivePlayer();
                expect(context.millenniumFalcon).toBeInZone('hand');
            });

            it('should enter play ready if rescued from capture', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish']
                    },
                    player2: {
                        spaceArena: [{ card: 'cartel-spacer', capturedUnits: ['millennium-falcon#piece-of-junk'] }]
                    }
                });

                const { context } = contextRef;

                // defeat RR to rescue Falcon
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.cartelSpacer);

                // Falcon comes back into play ready
                expect(context.millenniumFalcon.exhausted).toBeFalse();
            });

            it('should enter ready if played from discard', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                        hand: ['palpatines-return']
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // defeat Falcon
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.millenniumFalcon);

                // play Falcon with Palpatine's Return
                context.player1.clickCard(context.palpatinesReturn);
                context.player1.clickCard(context.millenniumFalcon);

                // Falcon comes back into play ready
                expect(context.millenniumFalcon.exhausted).toBeFalse();
            });
        });
    });
});
