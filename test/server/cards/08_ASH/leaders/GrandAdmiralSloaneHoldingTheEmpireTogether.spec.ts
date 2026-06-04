describe('Grand Admiral Sloane, Holding the Empire Together', function() {
    integration(function(contextRef) {
        describe('leader side ability', function() {
            it('should exhaust to give each ground unit Sentinel and Overwhelm for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-sloane#holding-the-empire-together',
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battle-droid', 'wampa'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralSloane);
                context.player1.clickPrompt('Choose an arena. Give each unit in that arena Sentinel and Overwhelm for this phase');

                expect(context.player1).toHavePrompt('Choose an arena');
                expect(context.player1).toHaveExactPromptButtons(['Ground', 'Space']);
                context.player1.clickPrompt('Ground');

                expect(context.grandAdmiralSloane.exhausted).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.battleDroid.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.battleDroid.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.wampa.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.wampa.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.awing.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.awing.hasSomeKeyword('overwhelm')).toBeFalse();
                expect(context.tielnFighter.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.tielnFighter.hasSomeKeyword('overwhelm')).toBeFalse();

                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.battleDroid);
                expect(context.p2Base.damage).toBe(2);

                context.moveToNextActionPhase();

                expect(context.battlefieldMarine.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.battlefieldMarine.hasSomeKeyword('overwhelm')).toBeFalse();
                expect(context.battleDroid.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.battleDroid.hasSomeKeyword('overwhelm')).toBeFalse();
            });

            it('should exhaust to give each space unit Sentinel and Overwhelm for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-sloane#holding-the-empire-together',
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battle-droid'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralSloane);
                context.player1.clickPrompt('Choose an arena. Give each unit in that arena Sentinel and Overwhelm for this phase');
                context.player1.clickPrompt('Space');

                expect(context.awing.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.awing.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.tielnFighter.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.tielnFighter.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.battlefieldMarine.hasSomeKeyword('overwhelm')).toBeFalse();
                expect(context.battleDroid.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.battleDroid.hasSomeKeyword('overwhelm')).toBeFalse();
            });
        });

        describe('leader unit side ability', function() {
            it('should give each other friendly unit Overwhelm and Sentinel', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'grand-admiral-sloane#holding-the-empire-together', deployed: true },
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battle-droid', 'wampa'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                expect(context.battlefieldMarine.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.awing.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.awing.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.grandAdmiralSloane.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.grandAdmiralSloane.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.battleDroid.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.battleDroid.hasSomeKeyword('overwhelm')).toBeFalse();
                expect(context.wampa.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.tielnFighter.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.tielnFighter.hasSomeKeyword('overwhelm')).toBeFalse();

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player2.clickCard(context.battlefieldMarine);
            });
        });
    });
});
