describe('Third Sister, Seething With Ambition', function () {
    integration(function (contextRef) {
        describe('Third Sister\'s undeployed ability', function () {
            it('should allow the player to play a unit, paying its cost, and give it hidden for this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dagobah-swamp',
                        leader: 'third-sister#seething-with-ambition',
                        hand: ['iden-versio#adapt-or-die', 'vanquish', 'generals-blade', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.thirdSister);
                context.player1.clickPrompt('Play a unit from your hand. It gains Hidden for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.idenVersio, context.battlefieldMarine]);
                context.player1.clickCard(context.idenVersio);

                expect(context.idenVersio).toBeInZone('groundArena');
                expect(context.idenVersio.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(4);

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base]);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.hasSomeKeyword('hidden')).toBeFalse();

                context.moveToNextActionPhase();
                expect(context.battlefieldMarine.hasSomeKeyword('hidden')).toBeFalse();
                expect(context.idenVersio.hasSomeKeyword('hidden')).toBeFalse();
                expect(context.idenVersio).toHaveExactUpgradeNames(['shield']);

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.idenVersio, context.battlefieldMarine]);

                context.player2.clickCard(context.idenVersio);
                expect(context.idenVersio).toHaveExactUpgradeNames([]);
            });
        });

        describe('Third Sister\'s deployed on attack ability', function () {
            it('should give hidden to the next unit you play this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dagobah-swamp',
                        leader: { card: 'third-sister#seething-with-ambition', deployed: true },
                        hand: ['iden-versio#adapt-or-die', 'battlefield-marine', 'crafty-smuggler'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        hand: ['wampa', 'takedown'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.thirdSister);
                context.player1.clickCard(context.p2Base);
                expect(context.getChatLogs(1)).toEqual(['player1 uses Third Sister to give Hidden to the next unit they will play this phase']);

                context.player2.clickCard(context.wampa);
                expect(context.wampa.hasSomeKeyword('hidden')).toBeFalse();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.hasSomeKeyword('hidden')).toBeTrue();

                context.player2.claimInitiative();

                context.player1.clickCard(context.craftySmuggler);
                expect(context.craftySmuggler.hasSomeKeyword('hidden')).toBeFalse();

                context.moveToNextActionPhase();

                expect(context.battlefieldMarine.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.craftySmuggler.hasSomeKeyword('hidden')).toBeFalse();

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.thirdSister);

                expect(context.battlefieldMarine.hasSomeKeyword('hidden')).toBeTrue();
            });

            it('should not give hidden to units played with piloting', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dagobah-swamp',
                        leader: { card: 'third-sister#seething-with-ambition', deployed: true },
                        hand: ['iden-versio#adapt-or-die', 'battlefield-marine', 'crafty-smuggler'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        hand: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.thirdSister);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.wampa);
                expect(context.wampa.hasSomeKeyword('hidden')).toBeFalse();

                context.player1.clickCard(context.idenVersio);
                context.player1.clickPrompt('Play Iden Versio with Piloting');
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer.hasSomeKeyword('hidden')).toBeFalse();
                expect(context.idenVersio.hasSomeKeyword('hidden')).toBeFalse();

                context.player2.passAction();

                context.player1.clickCard(context.craftySmuggler);
                expect(context.craftySmuggler.hasSomeKeyword('hidden')).toBeTrue();

                context.moveToNextActionPhase();

                expect(context.cartelSpacer.hasSomeKeyword('hidden')).toBeFalse();
                expect(context.idenVersio.hasSomeKeyword('hidden')).toBeFalse();
                expect(context.craftySmuggler.hasSomeKeyword('hidden')).toBeTrue();
            });

            it('should not give hidden to units played in the next phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dagobah-swamp',
                        leader: { card: 'third-sister#seething-with-ambition', deployed: true },
                        hand: ['iden-versio#adapt-or-die', 'battlefield-marine', 'crafty-smuggler'],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        hand: ['wampa'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.thirdSister);
                context.player1.clickCard(context.p2Base);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.hasSomeKeyword('hidden')).toBeFalse();

                context.player2.clickCard(context.wampa);
                expect(context.wampa.hasSomeKeyword('hidden')).toBeFalse();
            });
        });
    });
});
