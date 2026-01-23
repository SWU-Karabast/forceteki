describe('Common Cause', function () {
    integration(function (contextRef) {
        describe('Common Cause\'s ability', function () {
            it('should give +1/+1 when controlling a unit with 1 aspect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['common-cause'],
                        // Wampa has Aggression
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                const wampaPower = context.wampa.getPower();
                const wampaHp = context.wampa.getHp();

                context.player1.clickCard(context.commonCause);
                context.player1.clickCard(context.wampa);

                // With 1 aspect (Aggression), Wampa should get +1/+1
                expect(context.wampa.getPower()).toBe(wampaPower + 1);
                expect(context.wampa.getHp()).toBe(wampaHp + 1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give +0/+0 if no units are controlled', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['common-cause']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                const wampaPower = context.wampa.getPower();
                const wampaHp = context.wampa.getHp();

                context.player1.clickCard(context.commonCause);
                context.player1.clickCard(context.wampa);

                // No units controlled by player1, so +0/+0
                expect(context.wampa.getPower()).toBe(wampaPower);
                expect(context.wampa.getHp()).toBe(wampaHp);
            });

            it('should give +0/+0 if units with no aspects are controlled', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['common-cause'],
                        groundArena: ['underworld-thug']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                const wampaPower = context.wampa.getPower();
                const wampaHp = context.wampa.getHp();

                context.player1.clickCard(context.commonCause);
                context.player1.clickCard(context.wampa);

                // No units controlled by player1, so +0/+0
                expect(context.wampa.getPower()).toBe(wampaPower);
                expect(context.wampa.getHp()).toBe(wampaHp);
            });

            it('should only last for this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['common-cause'],
                        // Wampa = Aggression
                        groundArena: ['wampa']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                const wampaPower = context.wampa.getPower();
                const wampaHp = context.wampa.getHp();

                context.player1.clickCard(context.commonCause);
                context.player1.clickCard(context.wampa);

                // Wampa has Aggression = 1 aspect
                expect(context.wampa.getPower()).toBe(wampaPower + 1);
                expect(context.wampa.getHp()).toBe(wampaHp + 1);

                // Move to next action phase
                context.moveToNextActionPhase();

                // Effect should be gone
                expect(context.wampa.getPower()).toBe(wampaPower);
                expect(context.wampa.getHp()).toBe(wampaHp);
            });

            it('should give +3/+3 when controlling units with 3 different aspects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['common-cause'],
                        groundArena: ['wampa', 'chio-fain#fourarmed-slicer'],
                        spaceArena: ['inferno-four#unforgetting']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                const wampaPower = context.wampa.getPower();
                const wampaHp = context.wampa.getHp();

                context.player1.clickCard(context.commonCause);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(wampaPower + 3);
                expect(context.wampa.getHp()).toBe(wampaHp + 3);
            });
        });
    });
});
