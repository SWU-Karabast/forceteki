describe('Unrefusable Offer', function () {
    integration(function (contextRef) {
        describe('Unrefusable Offer\'s Bounty ability', function () {
            it('should play defeated unit (enters ready) and defeat it at the start of regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['unrefusable-offer'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.exhausted).toBeFalse();

                context.setDamage(context.p2Base, 0);
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                context.moveToNextActionPhase();
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('should play defeated unit (enters ready) and defeat it at the start of regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: [{ card: 'superlaser-technician', upgrades: ['unrefusable-offer'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.superlaserTechnician);
                context.player1.clickPrompt('You');
                context.player1.clickPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');

                expect(context.player2).toBeActivePlayer();

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.exhausted).toBeFalse();

                context.setDamage(context.p2Base, 0);
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                context.moveToNextActionPhase();
                expect(context.battlefieldMarine).toBeInZone('discard');
            });

            it('should play defeated unit (enters ready) and defeat it at the start of regroup phase (was defeated earlier)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['unrefusable-offer'] }, 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.exhausted).toBeFalse();

                context.setDamage(context.p2Base, 0);
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.moveToNextActionPhase();

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.atst).toBeInZone('groundArena');
                expect(context.wampa).toBeInZone('groundArena');
            });

            it('should play defeated unit (enters ready) and defeat it at the start of regroup phase (was defeated and played again earlier, should not defeat it)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['spark-of-hope'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['unrefusable-offer'] }, 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Collect Bounty: Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it');

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine.exhausted).toBeFalse();

                context.setDamage(context.p2Base, 0);
                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atst);
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player2.clickCard(context.sparkOfHope);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('resource');

                context.moveToNextActionPhase();

                expect(context.battlefieldMarine).toBeInZone('resource');
                expect(context.atst).toBeInZone('groundArena');
                expect(context.wampa).toBeInZone('groundArena');
            });
        });
    });
});
