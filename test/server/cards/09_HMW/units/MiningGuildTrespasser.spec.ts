describe('Mining Guild Trespasser', function() {
    integration(function(contextRef) {
        describe('Mining Guild Trespasser\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['inferno-four#unforgetting', 'system-patrol-craft'],
                        hand: ['mining-guild-trespasser']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['wampa'],
                        hand: ['rivals-fall']
                    }
                });
            });

            it('should deal 2 damage to an enemy unit and enemy base.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.miningGuildTrespasser);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);


                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                // Check damage on unit and base
                expect(context.p2Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);
            });

            it('should deal 2 damage to an enemy unit and friendly base.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.miningGuildTrespasser);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);


                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
                context.player1.clickCard(context.greenSquadronAwing);

                // Check damage on unit and base
                expect(context.p1Base.damage).toBe(2);
                expect(context.greenSquadronAwing.damage).toBe(2);
            });

            it('should be able to be passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.miningGuildTrespasser);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Mining Guild Trespasser\'s ability no units', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mining-guild-trespasser']
                    },
                });
            });

            it('should deal 2 damage to an enemy base.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.miningGuildTrespasser);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                // Check damage on unit and base
                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});