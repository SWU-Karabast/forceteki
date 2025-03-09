describe('Phantom II, Modified to Dock', function() {
    integration(function(contextRef) {
        describe('Phantom\'s action ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [
                            'phantom-ii#modified-to-dock',
                            'the-ghost#heart-of-the-family',
                            'the-starhawk#prototype-battleship'
                        ],
                    },
                    player2: {
                        spaceArena: ['the-ghost#spectre-home-base', 'profundity#we-fight'],
                    }
                });
            });

            it('should attach itself to the Ghost as an upgrade', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.phantomIi);
                context.player1.clickPrompt('Attach this as an upgrade to The Ghost');
                expect(context.player1).toBeAbleToSelectExactly([context.theGhostHeartOfTheFamily, context.theGhostSpectreHomeBase]);

                context.player1.clickCard(context.theGhostHeartOfTheFamily);
                expect(context.theGhostHeartOfTheFamily).toHaveExactUpgradeNames(['phantom-ii#modified-to-dock']);
                expect(context.phantomIi.parentCard).toBe(context.theGhostHeartOfTheFamily);
            });

            it('should attach itself to the opponent\'s Ghost as an upgrade', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.phantomIi);
                context.player1.clickPrompt('Attach this as an upgrade to The Ghost');
                expect(context.player1).toBeAbleToSelectExactly([context.theGhostHeartOfTheFamily, context.theGhostSpectreHomeBase]);

                context.player1.clickCard(context.theGhostSpectreHomeBase);
                expect(context.theGhostSpectreHomeBase).toHaveExactUpgradeNames(['phantom-ii#modified-to-dock']);
                expect(context.phantomIi.parentCard).toBe(context.theGhostSpectreHomeBase);
            });
        });

        it('Phantom\'s action ability will remove all upgrades, rescue all captured units, and remove all damage before attaching', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [
                        {
                            card: 'phantom-ii#modified-to-dock',
                            upgrades: ['shield', 'academy-training'],
                            capturedUnits: ['wampa'],
                            damage: 2
                        },
                        'the-ghost#heart-of-the-family',
                    ],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.phantomIi);
            context.player1.clickPrompt('Attach this as an upgrade to The Ghost');
            context.player1.clickCard(context.theGhost);

            expect(context.shield).toBeInZone('outsideTheGame');
            expect(context.academyTraining).toBeInZone('discard');
            expect(context.wampa).toBeInZone('groundArena');
        });

        describe('Phantom\'s constant ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [
                            'phantom-ii#modified-to-dock',
                            'the-ghost#heart-of-the-family',
                        ],
                    },
                    player2: {
                        hand: ['open-fire'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.phantomIi);
                context.player1.clickPrompt('Attach this as an upgrade to The Ghost');
                context.player1.clickCard(context.theGhost);
            });

            it('should give the attached unit +3/+3', function() {
                const { context } = contextRef;

                expect(context.theGhostHeartOfTheFamily.getPower()).toBe(8);
                expect(context.theGhostHeartOfTheFamily.getHp()).toBe(9);

                context.player2.passAction();

                // do an attack to confirm stats work
                context.player1.clickCard(context.theGhostHeartOfTheFamily);
                context.player1.clickCard(context.theStarhawk);

                expect(context.theStarhawk.damage).toBe(8);
                expect(context.theGhostHeartOfTheFamily.damage).toBe(6);
            });

            it('should give the attached unit Grit', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.theGhost);

                expect(context.theGhost.getPower()).toBe(12);
            });
        });

        describe('When Phantom is attached', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [
                            'phantom-ii#modified-to-dock',
                            'the-ghost#heart-of-the-family',
                        ],
                    },
                    player2: {
                        hand: ['vanquish', 'confiscate', 'bamboozle']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.phantomIi);
                context.player1.clickPrompt('Attach this as an upgrade to The Ghost');
                context.player1.clickCard(context.theGhost);
            });

            it('it should be defeated when the attached unit is defeated', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.theGhost);

                expect(context.phantomIi).toBeInZone('discard');
            });

            it('it should be defeated when targeted by an upgrade defeat effect', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.phantomIi);

                expect(context.phantomIi).toBeInZone('discard');
            });

            it('it should be returned to hand by Bamboozle', function() {
                const { context } = contextRef;

                context.player2.clickCard(context.bamboozle);
                context.player2.clickCard(context.theGhost);

                expect(context.phantomIi).toBeInZone('hand');
            });
        });
    });
});
