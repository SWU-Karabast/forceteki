describe('Saw Gerrera, Bring Down the Empire', function() {
    integration(function(contextRef) {
        describe('Saw\'s undeployed ability', function() {
            it('should attack with a unit, give it +2/+0 and Overwhelm, then defeat that unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        leader: 'saw-gerrera#bring-down-the-empire',
                        base: 'colossus',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['secretive-sage'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrera);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.secretiveSage);

                expect(context.player2).toBeActivePlayer();
                expect(context.sawGerrera.exhausted).toBeTrue();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.p2Base.damage).toBe(3);
            });

            it('should attack with a unit, give it +2/+0 and Overwhelm, then defeat that unit, and not break if the unit dies from combat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        leader: 'saw-gerrera#bring-down-the-empire',
                        base: 'colossus',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrera);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.player2).toBeActivePlayer();
                expect(context.sawGerrera.exhausted).toBeTrue();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should work if Expendable Mercenary dies from combat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['expendable-mercenary'],
                        leader: 'saw-gerrera#bring-down-the-empire',
                        base: 'colossus',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrera);
                expect(context.player1).toBeAbleToSelectExactly([context.expendableMercenary]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.expendableMercenary);
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.sawGerrera.exhausted).toBeTrue();
                expect(context.expendableMercenary).toBeInZone('resource', context.player1);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should be able to be used with no targets', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'saw-gerrera#bring-down-the-empire',
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }],
                        base: 'colossus',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['secretive-sage'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrera);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.sawGerrera.exhausted).toBeTrue();
            });
        });

        describe('Saw\'s deployed triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        leader: { card: 'saw-gerrera#bring-down-the-empire', deployed: true },
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['secretive-sage', 'krayt-dragon'],
                    }
                });
            });

            it('should attack with a unit after Saw completes his attack, giving it +2/+0 and overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrera);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.secretiveSage);

                expect(context.player2).toBeActivePlayer();
                expect(context.sawGerrera.exhausted).toBeTrue();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.p2Base.damage).toBe(7);
            });

            it('should not trigger if he dies', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrera);
                context.player1.clickCard(context.kraytDragon);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrera);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('should work if Expendable Mercenary dies from combat while Saw is deployed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['expendable-mercenary'],
                        leader: { card: 'saw-gerrera#bring-down-the-empire', deployed: true },
                        base: 'colossus',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrera);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.expendableMercenary]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.expendableMercenary);
                context.player1.clickCard(context.deathStarStormtrooper);
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.sawGerrera.exhausted).toBeTrue();
                expect(context.expendableMercenary).toBeInZone('resource', context.player1);
                expect(context.p2Base.damage).toBe(8);
            });
        });
    });
});