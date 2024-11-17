describe('Qi\'ra, I Alone Survived', function() {
    integration(function(contextRef) {
        describe('Qi\'ra\'s leader undeployed ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-star-stormtrooper', 'scout-bike-pursuer'],
                        leader: 'qira#i-alone-survived',
                        resources: 4
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    },
                });
            });

            it('should damage a friendly unit and give it a shield', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.qira);
                expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer, context.deathStarStormtrooper]);
                context.player1.clickCard(context.scoutBikePursuer);

                // check damage and shield are applied
                expect(context.scoutBikePursuer.damage).toBe(2);
                expect(context.scoutBikePursuer).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should damage (and kill) a friendly unit with 3 power or less', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.qira);
                expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer, context.deathStarStormtrooper]);
                context.player1.clickCard(context.deathStarStormtrooper);

                // check stormtrooper is dead
                expect(context.deathStarStormtrooper.location).toBe('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Qi\'ra\'s leader deployed ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-star-stormtrooper', { card: 'scout-bike-pursuer', damage: 2, upgrades: ['shield'] }, { card: 'wampa', damage: 3, upgrades: ['fallen-lightsaber'] }],
                        leader: { card: 'qira#i-alone-survived' },
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                    },
                });
            });

            it('should heal all units and deal damage to each equal to half its remaining HP rounded down', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.qira);
                context.player1.clickPrompt('Deploy Qi\'ra');

                expect(context.qira.damage).toBe(4); // leader
                expect(context.deathStarStormtrooper.damage).toBe(0); // 1 HP
                expect(context.scoutBikePursuer.damage).toBe(0); // shielded
                expect(context.scoutBikePursuer).toHaveExactUpgradeNames([]);
                expect(context.wampa.damage).toBe(4); // hp upgraded
                expect(context.battlefieldMarine.damage).toBe(1); // opponent controlled

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
