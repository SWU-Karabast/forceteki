describe('Luminara Unduli, Besieged General', function() {
    integration(function(contextRef) {
        describe('Luminara\'s ability', function() {
            it('should attack with a unit and give it +2/+0 for the attack when she gets played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luminara-unduli#besieged-general'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.luminaraUnduli);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should be able to be passed when she gets played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luminara-unduli#besieged-general'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.luminaraUnduli);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.cartelSpacer.getPower()).toBe(2);
            });

            it('should attack with a unit and give it +2/+0 for the attack when another unit gets played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lurking-tie-phantom'],
                        groundArena: ['battlefield-marine', 'luminara-unduli#besieged-general'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer, context.luminaraUnduli]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
            });

            it('should be able to be passed when another unit gets played', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lurking-tie-phantom'],
                        groundArena: ['battlefield-marine', 'luminara-unduli#besieged-general'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.cartelSpacer, context.luminaraUnduli]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.cartelSpacer.getPower()).toBe(2);
                expect(context.luminaraUnduli.getPower()).toBe(7);
            });
        });
    });
});