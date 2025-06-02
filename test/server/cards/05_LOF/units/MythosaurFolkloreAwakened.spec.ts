describe('Mythosaur, Folklore Awakened', function() {
    integration(function(contextRef) {
        describe('Mythosaur\'s first constant ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'mythosaur#folklore-awakened',
                            {
                                card: 'satine-kryze#committed-to-peace',
                                upgrades: ['shield'],
                                damage: 2
                            },
                        ],
                        spaceArena: [
                            'razor-crest#reliable-gunship'
                        ],
                        hand: [
                            'in-pursuit',
                            'waylay'
                        ],
                        leader: 'kanan-jarrus#help-us-survive',
                        base: 'echo-base'
                    },
                    player2: {
                        leader: 'the-mandalorian#sworn-to-the-creed',
                        base: 'chopper-base',
                        groundArena: [
                            'grogu#irresistible'
                        ],
                        hand: [
                            'leia-organa#defiant-princess',
                            'cantina-bouncer',
                            'evacuate',
                            'outmaneuver',
                            'frozen-in-carbonite'
                        ]
                    }
                });
            });

            /**
             *********** Exhaust Prevention Tests ************
             **/

            it('prevents friendly upgraded units from being exhausted by enemy card action abilities', function() {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 uses Grogu's action ability to exhaust Satine Kryze
                context.player2.clickCard(context.grogu);
                context.player2.clickPrompt('Exhaust an enemy unit');
                context.player2.clickCard(context.satineKryze);

                // Satine Kryze is upgraded and should not be exhausted
                expect(context.satineKryze.exhausted).toBeFalse();
                expect(context.getChatLogs(1)).toContain('player1 uses Satine Kryze\'s gained ability from Mythosaur to prevent Satine Kryze from being exhausted');
            });

            it('prevents friendly upgraded units from being exhausted by enemy card triggered abilities', function() {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 plays Frozen in Carbonite on Mythosaur
                context.player2.clickCard(context.frozenInCarbonite);
                context.player2.clickCard(context.mythosaur);

                // Player 2 uses The Mandalorian's ability to exhaust Satine Kryze
                context.player2.clickPrompt('Exhaust this leader to exhaust an enemy unit with 4 or less remaining HP');
                context.player2.clickPrompt('Trigger');
                context.player2.clickCard(context.satineKryze);

                // Both Mythosaur and Satine Kryze are upgraded and should not be exhausted
                expect(context.mythosaur.exhausted).toBeFalse();
                expect(context.satineKryze.exhausted).toBeFalse();
                expect(context.getChatLogs(3)).toContain('player1 uses Mythosaur to prevent Mythosaur from being exhausted');
                expect(context.getChatLogs(3)).toContain('player1 uses Satine Kryze\'s gained ability from Mythosaur to prevent Satine Kryze from being exhausted');
            });

            it('prevents friendly upgraded units from being exhausted by enemy event abilities', function() {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 plays Outmaneuver to exhaust all ground units
                context.player2.clickCard(context.outmaneuver);
                context.player2.clickPrompt('Ground');

                // Satine Kryze is upgraded and should not be exhausted
                expect(context.satineKryze.exhausted).toBeFalse();

                // Enemy units and friendly non-upgraded units should be exhausted
                expect(context.mythosaur.exhausted).toBeTrue();
                expect(context.grogu.exhausted).toBeTrue();
            });

            it('does not prevent friendly upgraded units from being exhausted by friendly card abilities', function() {
                const { context } = contextRef;

                // Player 1 plays In Pursuit to exhaust Satine Kryze and Grogu
                context.player1.clickCard(context.inPursuit);
                context.player1.clickCard(context.satineKryze);
                context.player1.clickCard(context.grogu);

                // No exhaust was prevented
                expect(context.satineKryze.exhausted).toBeTrue();
                expect(context.grogu.exhausted).toBeTrue();
            });

            it('does not prevent friendly upgraded units from being exhausted as part of the steps of an attack', function() {
                const { context } = contextRef;

                // Player 1 uses Kanan Jarrus to give a Shield token to Mythosaur
                context.player1.clickCard(context.kananJarrus);
                context.player1.clickPrompt('Give a Shield token to a Creature or Spectre unit.');
                context.player1.clickCard(context.mythosaur);

                expect(context.mythosaur).toHaveExactUpgradeNames(['shield']);
                context.player2.passAction();

                // Player 1 uses Mythosaur to attack Player 2's base
                context.player1.clickCard(context.mythosaur);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);

                // Attack is resolved and Mythosaur is exhausted
                expect(context.mythosaur.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(10);
            });

            it('does not prevent friendly upgraded units from being exhausted as part of the cost of an ability', function() {
                const { context } = contextRef;

                // Player 1 uses Kanan Jarrus to give a Shield token to Mythosaur
                context.player1.clickCard(context.kananJarrus);
                context.player1.clickPrompt('Give a Shield token to a Creature or Spectre unit.');
                context.player1.clickCard(context.mythosaur);

                expect(context.mythosaur).toHaveExactUpgradeNames(['shield']);
                context.player2.passAction();

                // Player 1 uses Mythosaur's gained ability from Satine Kryze mill opponent
                context.player1.clickCard(context.mythosaur);
                context.player1.clickPrompt('Discard cards from an opponent\'s deck equal to half this unit\'s remaining HP, rounded up');

                // Ability is resolved and Mythosaur is exhausted
                expect(context.mythosaur.exhausted).toBeTrue();
                expect(context.player2.discard.length).toBe(5);
            });

            /**
             *********** Return to Hand Prevention Tests ************
             **/

            it('prevents friendly upgraded units from being returned to hand by enemy card triggered abilities', function() {
                const { context } = contextRef;

                // Player 1 uses Kanan Jarrus to give a Shield token to Mythosaur
                context.player1.clickCard(context.kananJarrus);
                context.player1.clickPrompt('Give a Shield token to a Creature or Spectre unit.');
                context.player1.clickCard(context.mythosaur);

                expect(context.mythosaur).toHaveExactUpgradeNames(['shield']);

                // Player 2 plays Cantina Bouncer to return Mythosaur to hand
                context.player2.clickCard(context.cantinaBouncer);
                context.player2.clickCard(context.mythosaur);

                // Mythosaur is not returned to hand due to its ability
                expect(context.mythosaur).toBeInZone('groundArena');
                expect(context.getChatLogs(1)).toContain('player1 uses Mythosaur to prevent Mythosaur from returning to hand');
            });

            it('prevents friendly upgraded units from being returned to hand by enemy event abilities', function() {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 plays Evacuate to return all units to hand
                context.player2.clickCard(context.evacuate);

                // Satine Kryze is upgraded and should not be returned to hand
                expect(context.satineKryze).toBeInZone('groundArena');

                // All other units should be returned to hand
                expect(context.mythosaur).toBeInZone('hand', context.player1);
                expect(context.razorCrest).toBeInZone('hand', context.player1);
                expect(context.grogu).toBeInZone('hand', context.player2);
                expect(context.getChatLogs(3)).toContain('player1 uses Satine Kryze\'s gained ability from Mythosaur to prevent Satine Kryze from returning to hand');
            });

            it('does not prevent friendly upgraded units from being returned to hand by friendly card abilities', function() {
                const { context } = contextRef;

                // Player 1 plays Waylay to return Satine Kryze to hand
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.satineKryze);

                // Satine Kryze is returned to hand
                expect(context.satineKryze).toBeInZone('hand', context.player1);
            });
        });

        describe('Mythosaur\'s second constant ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'mythosaur#folklore-awakened', upgrades: ['the-darksaber'] },
                        ],
                        leader: 'obiwan-kenobi#courage-makes-heroes',
                    },
                    player2: {
                        leader: 'iden-versio#inferno-squad-commander',
                    }
                });
            });

            it('gives friendly undeployed leaders the Mandalorian trait', function() {
                const { context } = contextRef;
                expect(context.obiwanKenobi.hasSomeTrait('mandalorian')).toBeTrue();
            });

            it('does not give enemy undeployed leaders the Mandalorian trait', function() {
                const { context } = contextRef;
                expect(context.idenVersio.hasSomeTrait('mandalorian')).toBeFalse();
            });

            it('gives friendly deployed leaders the Mandalorian trait', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.obiwanKenobi);
                context.player1.clickPrompt('Deploy Obi-Wan Kenobi');

                expect(context.obiwanKenobi.hasSomeTrait('mandalorian')).toBeTrue();
                context.player2.passAction();

                // Verify that The Darksaber's ability gives Obi-Wan an experience token
                context.player1.clickCard(context.mythosaur);
                context.player1.clickCard(context.p2Base);

                expect(context.obiwanKenobi).toHaveExactUpgradeNames(['experience']);
            });

            it('does not give enemy deployed leaders the Mandalorian trait', function() {
                const { context } = contextRef;
                context.player1.passAction();

                context.player2.clickCard(context.idenVersio);
                context.player2.clickPrompt('Deploy Iden Versio');

                expect(context.idenVersio.hasSomeTrait('mandalorian')).toBeFalse();
            });
        });
    });
});
