describe('Overwhelm keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Overwhelm keyword attacks,', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: [
                            'partisan-insurgent',
                            'specforce-soldier',
                            { card: 'battlefield-marine', upgrades: ['shield'] }
                        ],
                        hand: ['waylay']
                    }
                });
            });

            it('it deals any excess damage to the target\'s base', function () {
                const { context } = contextRef;

                // CASE 1: overwhelm damage applies
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);
                expect(context.p2Base.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
                expect(context.wampa.exhausted).toBe(true);

                context.player2.passAction();
                context.setDamage(context.wampa, 0);
                context.readyCard(context.wampa);
                context.setDamage(context.p2Base, 0);

                // CASE 2: shield prevents overwhelm
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.p2Base.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.battlefieldMarine.isUpgraded()).toBe(false);
                expect(context.wampa.damage).toBe(3);
                expect(context.wampa.exhausted).toBe(true);

                context.setDamage(context.wampa, 0);

                // CASE 3: overwhelm doesn't work when the unit is defending
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);

                context.setDamage(context.wampa, 0);
                context.readyCard(context.wampa);

                // CASE 4: no overwhelm damage if attacking base
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                context.player2.passAction();
                context.readyCard(context.wampa);
                context.setDamage(context.p2Base, 0);

                // CASE 5: no overwhelm damage if unit's hp is not exceeded
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.partisanInsurgent);
                expect(context.p2Base.damage).toBe(0);
            });

            it('after it was removed from play and played again it should only deal excess damage once', function() {
                const { context } = contextRef;
                context.player1.passAction();
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.wampa);
                context.readyCard(context.wampa);
                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);
                expect(context.p2Base.damage).toBe(2);
                expect(context.wampa.damage).toBe(2);
                expect(context.wampa.exhausted).toBe(true);
            });
        });

        describe('When a unit with the Overwhelm keyword attacks', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            {
                                card: 'emperor-palpatine#master-of-the-dark-side',
                                upgrades: ['fallen-lightsaber']
                            },
                            'cloudrider'
                        ]
                    },
                    player2: {
                        hand: ['traitorous'],
                        groundArena: ['death-star-stormtrooper']
                    }
                });
            });

            it('and the unit is defeated before damage is resolved, all damage goes to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.p2Base.damage).toBe(9);
            });

            it('a stolen unit, and the unit is defeated before damage is resolved, all damage goes to the opponent\'s base', function () {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 takes control of Cloud-Rider with Traitorous
                context.player2.clickCard(context.traitorous);
                context.player2.clickCard(context.cloudrider);
                expect(context.cloudrider).toBeInZone('groundArena', context.player2);

                // Emperor Palpatine attacks Cloud-Rider
                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.cloudrider);

                expect(context.cloudrider).toBeInZone('discard', context.player1);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(9);
            });
        });

        describe('When a unit with the Overwhelm and Ambush keyword attacks', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['gor#grievouss-pet'],
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper']
                    }
                });
            });

            it('and the unit is defeated all damage goes to base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.gorGrievoussPet);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(6); // 1 for stormtrooper, 6 for base
            });
        });
    });
});
