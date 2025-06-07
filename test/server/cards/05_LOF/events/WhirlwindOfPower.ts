describe('Whirlwind Of Power', function() {
    integration(function(contextRef) {
        describe('Whirlwind Of Power\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['whirlwind-of-power'],
                        groundArena: ['karis#we-dont-like-strangers'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
            });

            it('should give -3/-3 to wampa for this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.WhirlwindOfPower);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing, context.karis]);
                expect(context.player1).not.toHavePassAbilityButton();

                // give -3/-3 to wampa
                context.player1.clickCard(context.wampa);
                expect(context.wampa.getPower()).toBe(1);
                expect(context.wampa.getHp()).toBe(2);

                // we move to next phase to see that the effect only works till the end of the phase
                context.moveToRegroupPhase();
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });
        });

        describe('Whirlwind Of Power', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['whirlwind-of-power'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });
            });

            it('should give -2/-2 to wampa', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.WhirlwindOfPower);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing, context.lurkingTiePhantom]);
                expect(context.player1).not.toHavePassAbilityButton();

                // give -2/-2 to Lurking tie phantom
                context.player1.clickCard(context.wampa);
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(3);

                // we move to next phase to see that the effect only works till the end of the phase
                context.moveToRegroupPhase();
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('should give -2/-2 to Lurking tie phantom, defeating it', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.WhirlwindOfPower);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing, context.lurkingTiePhantom]);
                expect(context.player1).not.toHavePassAbilityButton();

                // give -2/-2 to Lurking tie phantom
                context.player1.clickCard(context.lurkingTiePhantom);
                expect(context.lurkingTiePhantom).toBeInZone('discard');
            });
        });
    });
});
