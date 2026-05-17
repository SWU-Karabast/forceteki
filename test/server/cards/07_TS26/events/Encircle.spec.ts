describe('Encircle', function() {
    integration(function(contextRef) {
        describe('Encircle\'s event ability', function() {
            it('should allow a friendly ground unit to capture an enemy ground non-leader unit and should cost 1 resource less for each friendly units (2 resource less)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['encircle'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tieln-fighter'],
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.encircle);
                expect(context.player1).toHavePrompt('A friendly unit captures an enemy non-leader unit in the same arena');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tielnFighter]);
                context.player1.clickCard(context.battlefieldMarine);

                // Only ground units in the same arena (ground) should be selectable
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeCapturedBy(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should allow a friendly ground unit to capture an enemy ground non-leader unit and should cost 1 resource less for each friendly units (4 resource less)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['encircle'],
                        groundArena: ['battlefield-marine', 'yoda#old-master', 'gungi#finding-himself'],
                        spaceArena: ['tieln-fighter'],
                        base: 'echo-base'
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.encircle);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeCapturedBy(context.battlefieldMarine);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should allow a friendly space unit to capture an enemy space non-leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['encircle'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer', 'tie-advanced'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.encircle);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);

                // Only space units in the same arena (space) should be selectable
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.tieAdvanced]);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player2).toBeActivePlayer();
                expect(context.cartelSpacer).toBeCapturedBy(context.tielnFighter);
            });
        });
    });
});
