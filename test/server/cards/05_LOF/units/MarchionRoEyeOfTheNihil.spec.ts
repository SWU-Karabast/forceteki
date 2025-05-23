describe('Marchion Ro, Eye of the Nihil', function() {
    integration(function(contextRef) {
        describe('Marchion Ro\'s constant ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'the-crystal-city', damage: 10 },
                        hand: [
                            'constructed-lightsaber',
                            'clone-cohort',
                            'rallying-cry'
                        ],
                        groundArena: [
                            'marchion-ro#eye-of-the-nihil',
                            'nihil-marauder',
                            { card: 'fifth-brother#fear-hunter', damage: 2 },
                            'darth-sidious#the-phantom-menace',
                        ],
                        spaceArena: [
                            'forged-starfighter',
                        ]
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('doubles the raid value of friendly units', function() {
                const { context } = contextRef;

                // Attack with the Nihil Marauder
                context.player1.clickCard(context.nihilMarauder);
                context.player1.clickCard(context.p2Base);

                // 1 Power + Raid 6
                expect(context.p2Base.damage).toBe(7);
                context.player2.passAction();

                // Attack with Forged Starfighter
                context.player1.clickCard(context.forgedStarfighter);
                context.player1.clickCard(context.p2Base);

                // 1 Power + Raid 2
                expect(context.p2Base.damage).toBe(10);
                context.player2.passAction();

                // Attack with Fifth Brother
                context.player1.clickCard(context.fifthBrother);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Pass');

                // 2 Power + Raid 4
                expect(context.p2Base.damage).toBe(16);
            });

            it('does not double the raid value of enemy units', function() {
                const { context } = contextRef;
                context.player1.passAction();

                // Attack with the Green Squadron A-Wing
                context.player2.clickCard(context.greenSquadronAwing);
                context.player2.clickCard(context.p1Base);

                // 1 Power + Raid 2
                expect(context.p1Base.damage).toBe(13); // Base started with 10 damage
            });

            it('doubles Marchion Ro\'s own raid value', function() {
                const { context } = contextRef;

                // Play Clone Cohort to give Marchion Ro Raid 2
                context.player1.clickCard(context.cloneCohort);
                context.player1.clickCard(context.marchionRo);
                context.player2.passAction();

                // Attack with Marchion Ro
                context.player1.clickCard(context.marchionRo);
                context.player1.clickCard(context.p2Base);

                // 6 Power + Raid 4
                expect(context.p2Base.damage).toBe(10);
            });

            it('applies the multiplier after all stacked raid effects', function() {
                const { context } = contextRef;

                // Play Rallying Cry to give each friendly unit Raid 2
                context.player1.clickCard(context.rallyingCry);
                context.player2.passAction();

                // Play Clone Cohort on Fifth Brother to give him Raid 2
                context.player1.clickCard(context.cloneCohort);
                context.player1.clickCard(context.fifthBrother);
                context.player2.passAction();

                // Play Constructed Lightsaber on Fifth Brother, giving him +2/+3 and Raid 2
                context.player1.clickCard(context.constructedLightsaber);
                context.player1.clickCard(context.fifthBrother);
                context.player2.passAction();

                // Attack with Fifth Brother
                context.player1.clickCard(context.fifthBrother);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Pass');

                // 4 Power + Raid 16
                //   - 2 from Fifth Brother's own ability
                //   - 2 from Rallying Cry
                //   - 2 from Clone Cohort
                //   - 2 from Constructed Lightsaber
                //   - Doubled by Marchion Ro's ability
                expect(context.p2Base.damage).toBe(20);
            });

            it('does not double other numeric keywords', function() {
                const { context } = contextRef;

                // Attack with Darth Sidious
                context.player1.clickCard(context.darthSidious);
                context.player1.clickCard(context.p2Base);

                // Restore 2
                expect(context.p1Base.damage).toBe(8);
            });
        });
    });
});