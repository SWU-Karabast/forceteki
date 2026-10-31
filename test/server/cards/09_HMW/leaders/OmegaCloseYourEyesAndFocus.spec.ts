describe('Omega, Close Your Eyes and Focus', function () {
    integration(function (contextRef) {
        const leaderAbility = 'Attack with a Heroism unit. It gains Grit for this attack.';

        describe('Omega\'s leader side ability', function () {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'omega#close-your-eyes-and-focus',
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'wampa'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['atst', { card: 'yoda#old-master', damage: 2 }]
                    }
                });
            });

            it('should initiate an attack with a Heroism unit, granting it Grit for the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.omega);
                context.player1.clickPrompt(leaderAbility);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.omega.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should initiate an attack with a Heroism unit (even if not damaged), granting it Grit for the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.omega);
                context.player1.clickPrompt(leaderAbility);

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
                expect(context.omega.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('Omega\'s leader unit side ability', function () {
            it('should give Grit to other friendly Heroism units while deployed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'omega#close-your-eyes-and-focus', deployed: true, damage: 5 },
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'wampa'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['atst', { card: 'yoda#old-master', damage: 2 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);

                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.yoda.getPower()).toBe(2);
                expect(context.yoda.getHp()).toBe(4);

                expect(context.greenSquadronAwing.getPower()).toBe(1);
                expect(context.greenSquadronAwing.getHp()).toBe(3);

                expect(context.omega.getPower()).toBe(2);
                expect(context.omega.getHp()).toBe(7);
            });
        });
    });
});
