describe('Lightmaker, I Have An Idea', function () {
    integration(function (contextRef) {
        describe('Lightmaker\'s when defeated ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['lightmaker#i-have-an-idea', 'awing'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['vanquish'],
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should prompt to choose an arena and exhaust each enemy unit in the chosen arena (Ground)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lightmakerIHaveAnIdea);

                // controller (player1) chooses arena
                expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
                context.player1.clickPrompt('Ground');

                // Only enemy ground units are exhausted
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.atst.exhausted).toBeTrue();
                // enemy space unit unaffected
                expect(context.cartelSpacer.exhausted).toBeFalse();
                // friendly units unaffected
                expect(context.battlefieldMarine.exhausted).toBeFalse();
            });

            it('should prompt to choose an arena and exhaust each enemy unit in the chosen arena (Space)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.lightmakerIHaveAnIdea);

                expect(context.player1).toHaveEnabledPromptButtons(['Ground', 'Space']);
                context.player1.clickPrompt('Space');

                expect(context.cartelSpacer.exhausted).toBeTrue();
                expect(context.awing.exhausted).toBeFalse();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.atst.exhausted).toBeFalse();
            });
        });

        it('should prompt to choose an arena and exhaust each enemy unit in the chosen arena (No Glory Only Results)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['lightmaker#i-have-an-idea', 'awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['no-glory-only-results'],
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.lightmakerIHaveAnIdea);

            expect(context.player2).toHaveEnabledPromptButtons(['Ground', 'Space']);
            context.player2.clickPrompt('Ground');

            expect(context.player1).toBeActivePlayer();
            expect(context.battlefieldMarine.exhausted).toBeTrue();

            expect(context.wampa.exhausted).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.cartelSpacer.exhausted).toBeFalse();
        });


        it('Lightmaker\'s when defeated ability should does nothing if opponent does not have any units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['lightmaker#i-have-an-idea', 'awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hasInitiative: true,
                    hand: ['vanquish'],
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.lightmakerIHaveAnIdea);

            expect(context.player1).toBeActivePlayer();
        });
    });
});
