describe('Mando\'s N-1 Starfighter, Faster Than A Fathier', function() {
    integration(function(contextRef) {
        describe('On Attack ability', function() {
            it('should exhaust a friendly leader to give +2/+0 for this attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mandos-n1-starfighter#faster-than-a-fathier'],
                        leader: 'boba-fett#collecting-the-bounty'
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mandosN1Starfighter);
                context.player1.clickCard(context.p2Base);

                // Ability triggers - select leader to exhaust
                expect(context.player1).toHavePrompt('Exhaust a friendly leader. If you do, this unit gets +2/+0 for this attack');
                context.player1.clickCard(context.bobaFett);

                expect(context.player2).toBeActivePlayer();

                expect(context.p2Base.damage).toBe(3);
                expect(context.bobaFett.exhausted).toBe(true);

                expect(context.mandosN1Starfighter.getPower()).toBe(1);
                expect(context.mandosN1Starfighter.getHp()).toBe(3);
            });

            it('should exhaust a friendly leader unit to give +2/+0 for this attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mandos-n1-starfighter#faster-than-a-fathier'],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mandosN1Starfighter);
                context.player1.clickCard(context.p2Base);

                // Ability triggers - select leader to exhaust
                expect(context.player1).toHavePrompt('Exhaust a friendly leader. If you do, this unit gets +2/+0 for this attack');
                context.player1.clickCard(context.bobaFett);

                expect(context.player2).toBeActivePlayer();

                expect(context.p2Base.damage).toBe(3);
                expect(context.bobaFett.exhausted).toBe(true);

                expect(context.mandosN1Starfighter.getPower()).toBe(1);
                expect(context.mandosN1Starfighter.getHp()).toBe(3);
            });

            it('should exhaust a friendly leader unit to give +2/+0 for this attack (leader are deployed as unit, vehicle is the new leader unit)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mandos-n1-starfighter#faster-than-a-fathier', 'awing'],
                        leader: { card: 'major-vonreg#red-baron' }
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.majorVonreg);
                context.player1.clickPrompt('Deploy Major Vonreg as a Pilot');
                context.player1.clickCard(context.awing);

                context.player2.passAction();

                context.player1.clickCard(context.mandosN1Starfighter);
                context.player1.clickCard(context.p2Base);

                // Ability triggers - select leader to exhaust
                expect(context.player1).toHavePrompt('Exhaust a friendly leader. If you do, this unit gets +2/+0 for this attack');
                expect(context.player1).toBeAbleToSelectExactly([context.awing]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();

                expect(context.p2Base.damage).toBe(3);
                expect(context.awing.exhausted).toBe(true);

                expect(context.mandosN1Starfighter.getPower()).toBe(1);
                expect(context.mandosN1Starfighter.getHp()).toBe(3);
            });

            it('should exhaust a friendly leader to give +2/+0 for this attack (support)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mandos-n1-starfighter#faster-than-a-fathier'],
                        spaceArena: ['awing'],
                        leader: { card: 'major-vonreg#red-baron' }
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mandosN1Starfighter);
                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);

                context.player1.clickCard(context.majorVonreg);

                expect(context.player2).toBeActivePlayer();
                expect(context.majorVonreg.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(4);
            });

            it('should allow passing the ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mandos-n1-starfighter#faster-than-a-fathier'],
                        leader: 'boba-fett#collecting-the-bounty'
                    },
                    player2: {
                        spaceArena: ['valiant-assault-ship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mandosN1Starfighter);
                context.player1.clickCard(context.valiantAssaultShip);

                expect(context.player1).toHavePrompt('Exhaust a friendly leader. If you do, this unit gets +2/+0 for this attack');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.valiantAssaultShip.damage).toBe(1);
                expect(context.bobaFett.exhausted).toBe(false);
            });

            it('should not have valid targets if leader is already exhausted', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mandos-n1-starfighter#faster-than-a-fathier'],
                        leader: { card: 'boba-fett#collecting-the-bounty', exhausted: true }
                    },
                    player2: {
                        spaceArena: ['valiant-assault-ship']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mandosN1Starfighter);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });
        });
    });
});
