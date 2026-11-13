describe('Negotiator, Prepare the Troops', function() {
    integration(function(contextRef) {
        describe('Negotiator\'s on attack ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['negotiator#prepare-the-troops'],
                        resources: ['battlefield-marine', 'atst', 'cartel-spacer'],
                        deck: ['wampa'],
                    },
                });
            });

            it('should resource the top card exhausted, then return a different friendly resource to hand', function() {
                const { context } = contextRef;

                // Negotiator attacks the enemy base
                context.player1.clickCard(context.negotiator);
                context.player1.clickCard(context.p2Base);

                // Top card is resourced exhausted, any friendly resource can be returned
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst, context.cartelSpacer, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                // Return AT-ST to hand
                context.player1.clickCard(context.atst);
                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.player1.resources.length).toBe(3);
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.p2Base.damage).toBe(9);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to return the card that was just resourced', function() {
                const { context } = contextRef;

                // Negotiator attacks the enemy base
                context.player1.clickCard(context.negotiator);
                context.player1.clickCard(context.p2Base);

                // Return the card that was just resourced
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.player1.resources.length).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow declining to return a resource', function() {
                const { context } = contextRef;

                // Negotiator attacks the enemy base
                context.player1.clickCard(context.negotiator);
                context.player1.clickCard(context.p2Base);

                // Decline to return a resource
                context.player1.clickPrompt('Pass');
                expect(context.player1.resources.length).toBe(4);
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player1.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should resource nothing with an empty deck but still allow returning a resource', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['negotiator#prepare-the-troops'],
                    resources: ['battlefield-marine', 'atst'],
                    deck: [],
                },
            });
            const { context } = contextRef;

            // Negotiator attacks the enemy base
            context.player1.clickCard(context.negotiator);
            context.player1.clickCard(context.p2Base);

            // Nothing is resourced, but a resource can still be returned
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst]);
            expect(context.player1).toHavePassAbilityButton();

            // Return AT-ST to hand
            context.player1.clickCard(context.atst);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(context.player1.resources.length).toBe(1);
        });

        describe('Negotiator\'s when defeated ability', function() {
            it('should trigger for its controller when defeated by an opponent\'s effect', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['negotiator#prepare-the-troops'],
                        resources: ['battlefield-marine', 'atst'],
                        deck: ['wampa'],
                    },
                    player2: {
                        hand: ['vanquish'],
                        resources: 5,
                    }
                });
                const { context } = contextRef;

                // Player 2 defeats Negotiator with Vanquish
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.negotiator);

                // Top card is resourced exhausted, any friendly resource can be returned
                expect(context.negotiator).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();


                // Return Battlefield Marine to hand
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
                expect(context.player1.resources.length).toBe(2);
            });

            it('should resolve On Attack then When Defeated when defeated during its own attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'negotiator#prepare-the-troops', damage: 6 }],
                        resources: ['battlefield-marine', 'atst'],
                        deck: ['wampa', 'consular-security-force'],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                    }
                });
                const { context } = contextRef;

                // Negotiator attacks Cartel Spacer and will be defeated
                context.player1.clickCard(context.negotiator);
                context.player1.clickCard(context.cartelSpacer);

                // On Attack resolves first
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // When Defeated resolves next
                expect(context.negotiator).toBeInZone('discard', context.player1);
                expect(context.consularSecurityForce).toBeInZone('resource', context.player1);
                expect(context.consularSecurityForce.exhausted).toBeTrue();
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // Both abilities resourced a card, neither returned one
                expect(context.player1.resources.length).toBe(4);
                expect(context.player1.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should resource and return for the opponent when they control Negotiator', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['negotiator#prepare-the-troops'],
                        hand: ['vanquish'],
                        resources: ['battlefield-marine', 'atst', 'cartel-spacer', 'wampa', 'consular-security-force', 'atat-suppressor', 'superlaser-technician', 'frontier-atrt'],
                        deck: ['yoda#old-master'],
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        resources: ['death-trooper', 'occupier-siege-tank', 'cantwell-arrestor-cruiser', 'collections-starhopper', 'armed-to-the-teeth', 'cell-block-guard', 'liberated-slaves', 'echo-base-defender'],
                        deck: ['fleet-lieutenant', 'rebel-pathfinder'],
                    }
                });
                const { context } = contextRef;

                // Player 2 takes control of Negotiator with Change of Heart
                context.player1.passAction();
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.negotiator);
                expect(context.negotiator).toBeInZone('spaceArena', context.player2);

                // Player 1 defeats Negotiator with Vanquish
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.negotiator);

                // Player 2 (controller) resources their top card exhausted and may return a resource
                expect(context.negotiator).toBeInZone('discard', context.player1);
                expect(context.fleetLieutenant).toBeInZone('resource', context.player2);
                expect(context.fleetLieutenant.exhausted).toBeTrue();
                expect(context.yodaOldMaster).toBeInZone('deck', context.player1);
                expect(context.player2).toHavePassAbilityButton();
                expect(context.player2).toBeAbleToSelectExactly([
                    context.deathTrooper,
                    context.occupierSiegeTank,
                    context.cantwellArrestorCruiser,
                    context.collectionsStarhopper,
                    context.armedToTheTeeth,
                    context.cellBlockGuard,
                    context.liberatedSlaves,
                    context.echoBaseDefender,
                    context.fleetLieutenant
                ]);

                // Return Death Trooper to hand
                context.player2.clickCard(context.deathTrooper);
                expect(context.deathTrooper).toBeInZone('hand', context.player2);
                expect(context.player2.resources.length).toBe(8);
                expect(context.player1.resources.length).toBe(8);
            });
        });

        it('should return a resource stolen from the opponent to its owner\'s hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'chopper-base',
                    leader: 'han-solo#audacious-smuggler',
                    spaceArena: ['negotiator#prepare-the-troops'],
                    resources: [
                        'dj#blatant-thief', 'atst', 'battlefield-marine', 'cartel-spacer', 'consular-security-force',
                        'death-trooper', 'occupier-siege-tank', 'atat-suppressor', 'superlaser-technician', 'frontier-atrt'
                    ],
                    deck: ['yoda#old-master'],
                },
                player2: {
                    resources: ['wampa'],
                }
            });
            const { context } = contextRef;

            // DJ steals Player 2's resource
            context.player1.clickCard(context.djBlatantThief);
            expect(context.wampa).toBeInZone('resource', context.player1);
            context.player2.passAction();

            // Negotiator attacks the enemy base
            context.player1.clickCard(context.negotiator);
            context.player1.clickCard(context.p2Base);

            // Every friendly resource, including the stolen Wampa, can be returned
            expect(context.player1).toBeAbleToSelectExactly([
                context.atst,
                context.battlefieldMarine,
                context.cartelSpacer,
                context.consularSecurityForce,
                context.deathTrooper,
                context.occupierSiegeTank,
                context.atatSuppressor,
                context.superlaserTechnician,
                context.frontierAtrt,
                context.wampa,
                context.yodaOldMaster
            ]);

            // Stolen Wampa returns to its owner's hand
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toBeInZone('hand', context.player2);
            expect(context.player1.hand.length).toBe(0);
        });
    });
});
