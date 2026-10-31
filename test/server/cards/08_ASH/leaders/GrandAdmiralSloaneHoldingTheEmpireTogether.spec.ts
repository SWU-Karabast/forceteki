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
                context.player1.clickPrompt('Give each unit in an arena Sentinel and Overwhelm for this phase');

                expect(context.player1).toHavePrompt('Choose an effect for Grand Admiral Sloane');
                expect(context.player1).toHaveExactPromptButtons(['Give each space unit Sentinel and Overwhelm for this phase', 'Give each ground unit Sentinel and Overwhelm for this phase']);

                // Space is listed first to match the client's arena layout
                expect(context.player1.currentPrompt().buttons.map((button) => button.text)).toEqual([
                    'Give each space unit Sentinel and Overwhelm for this phase',
                    'Give each ground unit Sentinel and Overwhelm for this phase'
                ]);
                context.player1.clickPrompt('Give each ground unit Sentinel and Overwhelm for this phase');

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
                expect(context.player1).toBeAbleToSelectExactly([context.battleDroid, context.wampa]);
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
                context.player1.clickPrompt('Give each unit in an arena Sentinel and Overwhelm for this phase');
                context.player1.clickPrompt('Give each space unit Sentinel and Overwhelm for this phase');

                expect(context.awing.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.awing.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.tielnFighter.hasSomeKeyword('sentinel')).toBeTrue();
                expect(context.tielnFighter.hasSomeKeyword('overwhelm')).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.battlefieldMarine.hasSomeKeyword('overwhelm')).toBeFalse();
                expect(context.battleDroid.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.battleDroid.hasSomeKeyword('overwhelm')).toBeFalse();
            });

            it('should allow choosing an arena with no units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'grand-admiral-sloane#holding-the-empire-together',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandAdmiralSloane);
                context.player1.clickPrompt('Give each unit in an arena Sentinel and Overwhelm for this phase');

                expect(context.player1).toHaveExactPromptButtons(['(No effect) Give each space unit Sentinel and Overwhelm for this phase', 'Give each ground unit Sentinel and Overwhelm for this phase']);
                context.player1.clickPrompt('(No effect) Give each space unit Sentinel and Overwhelm for this phase');

                expect(context.player2).toBeActivePlayer();
                expect(context.grandAdmiralSloane.exhausted).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('sentinel')).toBeFalse();
                expect(context.wampa.hasSomeKeyword('sentinel')).toBeFalse();
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
