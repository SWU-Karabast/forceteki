describe('IG-88, Ruthless Bounty Hunter', function () {
    integration(function (contextRef) {
        describe('IG-88\'s leader undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-star-stormtrooper', 'battlefield-marine'],
                        leader: 'ig88#ruthless-bounty-hunter',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['viper-probe-droid', 'wampa'],
                    },
                });
            });

            it('should attack with a friendly unit and does not buff because there are fewer friendly unit than enemy units', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.ig88);
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.battlefieldMarine]);
                // attack with battlefield marine, we do not have more unit than opponent so there is no buff
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
            });
        });

        describe('IG-88\'s leader undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-star-stormtrooper', 'battlefield-marine'],
                        leader: 'ig88#ruthless-bounty-hunter',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                    },
                });
            });

            it('should attack with a friendly unit with buff because there are more friendly units than enemy units)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.ig88);
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.battlefieldMarine]);

                // attack with battlefield marine, we have more unit than opponent so there is +1/+0
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });
        });

        describe('IG-88\'s leader ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-star-stormtrooper', 'battlefield-marine'],
                        leader: { card: 'ig88#ruthless-bounty-hunter', deployed: true },
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                    },
                });
            });

            it('should give Raid 1 to another friendly unit', function () {
                const { context } = contextRef;

                // attack with IG-88 without raid 1
                context.player1.clickCard(context.ig88);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
                context.player2.passAction();

                // attack with marine with raid 1
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(9);
            });
        });
    });
});
