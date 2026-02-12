describe('Asajj Ventress, Ambitious Apprentice', function() {
    integration(function(contextRef) {
        it('Asajj Ventress\'s undeployed ability should allow attacking with a token unit that gets +1/+0 for the attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'asajj-ventress#ambitious-apprentice',
                    hand: ['i-am-the-senate'],
                    groundArena: ['wampa'],
                    base: 'echo-base',
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.iAmTheSenate);
            const spies = context.player1.findCardsByName('spy');

            context.moveToNextActionPhase();

            context.player1.clickCard(context.asajjVentress);
            context.player1.clickPrompt('Attack with a token unit. It gets +1/+0 for this attack.');
            // wampa should not be selectable
            expect(context.player1).toBeAbleToSelectExactly([...spies]);
            context.player1.clickCard(spies[0]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.asajjVentress.exhausted).toBeTrue();
            expect(context.p2Base.damage).toBe(3);
            expect(spies[0].getPower()).toBe(0);
            expect(spies[0].exhausted).toBeTrue();
        });

        describe('Asajj Ventress\'s deployed ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'asajj-ventress#ambitious-apprentice', deployed: true },
                        hand: ['i-am-the-senate'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        hand: ['droid-deployment'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.iAmTheSenate);
                context.player2.clickCard(context.droidDeployment);
                context.moveToNextActionPhase();
            });

            it('should not get +2/+0 when a non-token unit has attacked this phase', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();

                expect(context.asajjVentress.getPower()).toBe(3);
                expect(context.asajjVentress.remainingHp).toBe(5);
            });

            it('should not get +2/+0 when a enemy token unit has attacked this phase', function() {
                const { context } = contextRef;

                context.player1.passAction();
                const droids = context.player2.findCardsByName('battle-droid');
                context.player2.clickCard(droids[0]);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();

                expect(context.asajjVentress.getPower()).toBe(3);
                expect(context.asajjVentress.remainingHp).toBe(5);
            });

            it('should get +2/+0 for this phase when a token unit has attacked this phase', function() {
                const { context } = contextRef;

                const spies = context.player1.findCardsByName('spy');
                context.player1.clickCard(spies[0]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();

                expect(context.asajjVentress.getPower()).toBe(5);
                expect(context.asajjVentress.remainingHp).toBe(5);

                context.player2.passAction();
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.asajjVentress.getPower()).toBe(5);
                expect(context.asajjVentress.remainingHp).toBe(5);

                context.moveToNextActionPhase();

                expect(context.asajjVentress.getPower()).toBe(3);
                expect(context.asajjVentress.remainingHp).toBe(5);
            });
        });
    });
});
