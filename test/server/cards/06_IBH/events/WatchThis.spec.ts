describe('Watch This', function() {
    integration(function(contextRef) {
        describe('Watch This\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['watch-this'],
                        groundArena: ['luke-skywalker#jedi-knight', 'consular-security-force']
                    },
                    player2: {
                        hand: ['blue-leader#scarif-air-support'],
                        groundArena: ['atst', 'wampa'],
                        spaceArena: ['tie-bomber']
                    }
                });
            });

            it('should return to hand an enemy ground unit which cost 6 or less to its owner\'s hand and exhaust all enemy units in its arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.watchThis);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.wampa, context.tieBomber, context.atst]);

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();

                expect(context.wampa).toBeInZone('hand');
                expect(context.atst.exhausted).toBeTrue();
                expect(context.tieBomber.exhausted).toBeFalse();
                expect(context.lukeSkywalker.exhausted).toBeFalse();
                expect(context.consularSecurityForce.exhausted).toBeFalse();
            });

            it('should return to hand a friendly ground unit which cost 6 or less to its owner\'s hand and exhaust all enemy units in its arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.watchThis);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.wampa, context.tieBomber, context.atst]);

                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();

                expect(context.consularSecurityForce).toBeInZone('hand');
                expect(context.atst.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.tieBomber.exhausted).toBeFalse();
                expect(context.lukeSkywalker.exhausted).toBeFalse();
            });

            it('should return to hand a space unit which cost 6 or less to its owner\'s hand and exhaust all enemy units in its arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.watchThis);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.wampa, context.tieBomber, context.atst]);

                context.player1.clickCard(context.tieBomber);

                expect(context.player2).toBeActivePlayer();

                expect(context.tieBomber).toBeInZone('hand');
                expect(context.atst.exhausted).toBeFalse();
                expect(context.consularSecurityForce.exhausted).toBeFalse();
                expect(context.lukeSkywalker.exhausted).toBeFalse();
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('should return to hand a enemy unit which had change its arena which cost 6 or less to its owner\'s hand and exhaust all enemy units in its arena', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.blueLeader);
                context.player2.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
                context.player2.clickPrompt('Trigger'); // trigger its move to the ground arena
                context.player2.clickPrompt('Pass'); // pass its ambush

                context.player1.clickCard(context.watchThis);
                expect(context.player1).toBeAbleToSelectExactly([context.blueLeader, context.consularSecurityForce, context.wampa, context.tieBomber, context.atst]);

                context.player1.clickCard(context.blueLeader);

                expect(context.player2).toBeActivePlayer();

                expect(context.blueLeader).toBeInZone('hand');
                expect(context.tieBomber.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeTrue();
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.consularSecurityForce.exhausted).toBeFalse();
                expect(context.lukeSkywalker.exhausted).toBeFalse();
            });
        });

        it('should not return to hand the chosen unit if he cannot but should exhaust all other enemy units in its arena', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['watch-this'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'chewbacca#faithful-first-mate']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.watchThis);
            context.player1.clickCard(context.chewbacca);

            expect(context.player2).toBeActivePlayer();
            expect(context.chewbacca).toBeInZone('groundArena');
            expect(context.chewbacca.exhausted).toBeFalse();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
        });
    });
});