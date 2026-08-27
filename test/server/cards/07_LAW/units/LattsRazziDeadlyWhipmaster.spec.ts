describe('Latts Razzi, Deadly Whipmaster', function() {
    integration(function(contextRef) {
        describe('Latts Razzi\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['latts-razzi#deadly-whipmaster'],
                        groundArena: [{ card: 'atst', exhausted: true }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: 'true' },
                    }
                });
            });

            it('should be able to give an Experience token to herself, then damage an enemy ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lattsRazziDeadlyWhipmaster);
                expect(context.player1).toHaveEnabledPromptButtons(['Give a Shield token to this unit', 'Give an Experience token to this unit']);
                context.player1.clickPrompt('Give an Experience token to this unit');
                expect(context.lattsRazziDeadlyWhipmaster).toHaveExactUpgradeNames(['experience']);

                expect(context.player1).toHavePrompt('Deal 3 damage to an enemy ground unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.darthVaderDarkLordOfTheSith
                ]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to give a Shield token to herself, then damage an enemy ground leader unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lattsRazziDeadlyWhipmaster);
                expect(context.player1).toHaveEnabledPromptButtons(['Give a Shield token to this unit', 'Give an Experience token to this unit']);
                context.player1.clickPrompt('Give a Shield token to this unit');
                expect(context.lattsRazziDeadlyWhipmaster).toHaveExactUpgradeNames(['shield']);

                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.darthVaderDarkLordOfTheSith
                ]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.darthVaderDarkLordOfTheSith);
                expect(context.darthVaderDarkLordOfTheSith.damage).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Latts Razzi\'s when played ability should give token and then do no damage if there are no enemy ground units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['latts-razzi#deadly-whipmaster'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lattsRazziDeadlyWhipmaster);
            context.player1.clickPrompt('Give an Experience token to this unit');

            expect(context.lattsRazziDeadlyWhipmaster.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.cartelSpacer.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
            expect(context.lattsRazziDeadlyWhipmaster).toBeInZone('groundArena');
            expect(context.lattsRazziDeadlyWhipmaster.exhausted).toBe(true);
        });

        describe('Latts Razzi and Krayt Dragon interaction', function () {
            it('should read LKI to deal damage from second part of her ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['latts-razzi#deadly-whipmaster'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['krayt-dragon'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lattsRazziDeadlyWhipmaster);

                // resolve Krayt Dragon
                context.player1.clickPrompt('Opponent');

                // kill Latts Razzi before she resolve her ability
                context.player2.clickCard(context.lattsRazzi);

                expect(context.player1).toHavePrompt('Deal 2 damage to an enemy ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kraytDragon]);
                context.player1.clickCard(context.kraytDragon);

                expect(context.player2).toBeActivePlayer();
                expect(context.kraytDragon.damage).toBe(2);
            });

            it('should read LKI to deal damage from second part of her ability (modified power because of The Son)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['latts-razzi#deadly-whipmaster'],
                        groundArena: ['battlefield-marine', 'the-son#embodiment-of-darkness'],
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['krayt-dragon'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lattsRazziDeadlyWhipmaster);

                // resolve Krayt Dragon
                context.player1.clickPrompt('Opponent');

                // kill Latts Razzi before she resolve her ability
                context.player2.clickCard(context.lattsRazzi);

                expect(context.player1).toHavePrompt('Deal 4 damage to an enemy ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kraytDragon]);
                context.player1.clickCard(context.kraytDragon);

                expect(context.player2).toBeActivePlayer();
                expect(context.kraytDragon.damage).toBe(4);
            });

            it('should read LKI from deck to deal damage from part of her ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['latts-razzi#deadly-whipmaster'],
                        groundArena: [{ damage: 4, card: 'quigon-jinn#the-negotiations-will-be-short' }],
                    },
                    player2: {
                        groundArena: ['krayt-dragon'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lattsRazziDeadlyWhipmaster);

                // resolve Krayt Dragon
                context.player1.clickPrompt('Opponent');

                // kill Qui-Gon Jinn
                context.player2.clickCard(context.quigonJinn);

                // return Latts Razzi to top of the deck
                context.player1.clickCard(context.lattsRazzi);
                context.player1.clickPrompt('Top');

                expect(context.player1).toHavePrompt('Deal 2 damage to an enemy ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.kraytDragon]);
                context.player1.clickCard(context.kraytDragon);

                expect(context.player2).toBeActivePlayer();
                expect(context.kraytDragon.damage).toBe(2);
            });
        });
    });
});