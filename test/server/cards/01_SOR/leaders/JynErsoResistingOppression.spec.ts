describe('Jyn Erso, Resisting Oppression', function() {
    integration(function(contextRef) {
        describe('Jyn Erso\'s leader ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#old-master'],
                        spaceArena: ['green-squadron-awing'],
                        leader: 'jyn-erso#resisting-oppression',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },
                });
            });

            it('should attack with a unit and defender get -1/-0', function() {
                const { context } = contextRef;

                // attack with jyn ability
                context.player1.clickCard(context.jynErso);

                // able to choose both arena units
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.greenSquadronAwing]);
                context.player1.clickCard(context.yoda);

                // able to choose units or base
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                context.player1.clickCard(context.wampa);

                // yoda should deal 2 damage and 4-1=3 from wampa
                expect(context.yoda.damage).toBe(3);
                expect(context.wampa.damage).toBe(2);
                expect(context.wampa.getPower()).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Jyn Erso\'s leader unit ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#old-master', 'wilderness-fighter'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'jyn-erso#resisting-oppression', deployed: true },
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['system-patrol-craft']
                    },
                });
            });

            it('should give -1/-0 on enemy unit who defend an attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.wampa);

                // yoda attack wampa, wampa should take 2 damage, yoda 4-1=3
                expect(context.yoda.damage).toBe(3);
                expect(context.wampa.damage).toBe(2);

                // wampa attack wilderness fighter, wampa should take 2 damage and wilderness fighter 4 and die
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.wildernessFighter);
                expect(context.wampa.damage).toBe(4);
                expect(context.wildernessFighter.location).toBe('discard');

                // awing attack sentinel, awing should take 3-1 damage and system patrol craft should take 3
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing.damage).toBe(2);
                expect(context.systemPatrolCraft.damage).toBe(3);
                context.player2.passAction();

                // jyn attack wampa, jyn should take 4-1=3 and wampa should die
                expect(context.wampa.location).toBe('ground arena');
                context.player1.clickCard(context.jynErso);
                context.player1.clickCard(context.wampa);
                expect(context.jynErso.damage).toBe(3);
                expect(context.wampa.location).toBe('discard');
            });
        });
    });
});
