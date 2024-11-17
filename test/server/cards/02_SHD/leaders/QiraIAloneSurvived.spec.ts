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

                // ready scout bike pursuer
                context.player1.clickCard(context.qira);
                expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer, context.deathStarStormtrooper]);
                context.player1.clickCard(context.scoutBikePursuer);

                // check damage is applied
                expect(context.scoutBikePursuer.damage).toBe(2);
                expect(context.scoutBikePursuer).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should damage (and kill) a friendly unit with 3 power or less', function() {
                const { context } = contextRef;

                // try to ready death star stormtrooper but damage will kill it
                context.player1.clickCard(context.qira);
                expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer, context.deathStarStormtrooper]);
                context.player1.clickCard(context.deathStarStormtrooper);

                // check stormtrooper is dead and no one is ready
                expect(context.deathStarStormtrooper.location).toBe('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Qi\'ra\'s leader deployed ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'death-star-stormtrooper', damage: 1 }, { card: 'scout-bike-pursuer', damage: 2, upgrades: ['shield'] }, { card: 'wampa', damage: 3, upgrades: ['fallen-lightsaber'] }],
                        leader: { card: 'qira#i-alone-survived' },
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                    },
                });
            });

            it('should heal all units and deal damage to each equal to half its remaining HP rounded down', function() {
                const { context } = contextRef;
                context.player1.setLeaderStatus({ card: 'qira#i-alone-survived', deployed: true });

                expect(context.scoutBikePursuer.damage).toBe(0);
            });

            /* it('should damage (and kill) a friendly unit with 3 power or less', function() {
                const { context } = contextRef;
                context.scoutBikePursuer.exhausted = true;
                context.wampa.exhausted = true;
                context.battlefieldMarine.exhausted = true;
                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickCard(context.p2Base);

                // try to ready death star stormtrooper but damage will kill it
                expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer, context.deathStarStormtrooper]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.deathStarStormtrooper);

                // check stormtrooper is dead and no one is ready
                expect(context.deathStarStormtrooper.location).toBe('discard');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.battlefieldMarine.exhausted).toBeTrue();
                expect(context.scoutBikePursuer.damage).toBe(0);
                expect(context.scoutBikePursuer.exhausted).toBeTrue();
                expect(context.wampa.damage).toBe(0);
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });*/
        });
    });
});
