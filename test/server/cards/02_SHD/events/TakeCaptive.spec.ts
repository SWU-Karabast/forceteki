describe('Take Captive', function() {
    integration(function(contextRef) {
        describe('Take Captive\'s event ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['take-captive'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['tieln-fighter']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should allow a friendly ground unit to capture an enemy ground non-leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takeCaptive);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tielnFighter]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeCapturedBy(context.battlefieldMarine);
            });

            it('should allow a friendly space unit to capture an enemy space non-leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.takeCaptive);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);

                expect(context.cartelSpacer).toBeCapturedBy(context.tielnFighter);
            });
        });

        it('Take Captive\'s event ability should only allow targeting friendly units that have legal capture targets', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-captive'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['tieln-fighter']
                },
                player2: {
                    spaceArena: ['cartel-spacer', 'tie-advanced'],
                    leader: { card: 'boba-fett#daimyo', deployed: true }
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeCaptive);

            // since only TIE/LN Fighter has legal targets, automatically choose it as the friendly unit and skip to capture targeting
            expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.tieAdvanced]);
            context.player1.clickCard(context.tieAdvanced);

            expect(context.tieAdvanced).toBeCapturedBy(context.tielnFighter);
        });
    });
});
