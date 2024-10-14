describe('Headhunting', function() {
    integration(function(contextRef) {
        describe('Headhunting\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['headhunting'],
                        groundArena: ['atst', 'reputable-hunter', 'wampa', { card: 'discerning-veteran', exhausted: true }],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'the-mandalorian#sworn-to-the-creed', deployed: true }
                    },
                    player2: {
                        groundArena: ['bounty-guild-initiate', 'consular-security-force'],
                    }
                });
            });

            it('should attack with three units', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.headhunting);

                // first attack, bounty hunter
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.reputableHunter, context.theMandalorian, context.wampa]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.reputableHunter);
                expect(context.player1).toBeAbleToSelectExactly([context.bountyGuildInitiate, context.consularSecurityForce]);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.reputableHunter.exhausted).toBe(true);
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.reputableHunter.damage).toBe(3);

                // second attack, non-bounty-hunter
                context.consularSecurityForce.damage = 0;
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.theMandalorian, context.wampa]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.atst);
                expect(context.player1).toBeAbleToSelectExactly([context.bountyGuildInitiate, context.consularSecurityForce]);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.atst.exhausted).toBe(true);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.atst.damage).toBe(3);

                // third attack, leader bounty hunter
                context.consularSecurityForce.damage = 0;
                expect(context.player1).toBeAbleToSelectExactly([context.theMandalorian, context.wampa]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.theMandalorian);
                expect(context.player1).toBeAbleToSelectExactly([context.bountyGuildInitiate, context.consularSecurityForce]);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.theMandalorian.exhausted).toBe(true);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.theMandalorian.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });

            // TODO: have a UI discussion on how we want the flow of passing to work in this situation
            it('should be able to select no target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.headhunting);

                // first attack - skip target resolution, go straight to next attack
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.reputableHunter, context.theMandalorian, context.wampa]);
                context.player1.clickPrompt('Choose no target');

                // second attack - select an attacker and go to target resolution, then pass
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.reputableHunter, context.theMandalorian, context.wampa]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.atst);
                expect(context.player1).toBeAbleToSelectExactly([context.bountyGuildInitiate, context.consularSecurityForce]);
                context.player1.clickPrompt('Pass attack');
                expect(context.atst.exhausted).toBe(false);

                // third attack - let it resolve to confirm things are working
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.reputableHunter, context.theMandalorian, context.wampa]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.theMandalorian);
                expect(context.player1).toBeAbleToSelectExactly([context.bountyGuildInitiate, context.consularSecurityForce]);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.theMandalorian.exhausted).toBe(true);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.theMandalorian.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Headhunting\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['headhunting'],
                        groundArena: ['atst', 'reputable-hunter'],
                        spaceArena: ['tieln-fighter'],
                    },
                    player2: {
                        groundArena: ['bounty-guild-initiate', 'consular-security-force'],
                    }
                });
            });

            it('should attack with as many units as available and then stop', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.headhunting);

                // first attack, bounty hunter
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.reputableHunter]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.reputableHunter);
                expect(context.player1).toBeAbleToSelectExactly([context.bountyGuildInitiate, context.consularSecurityForce]);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.reputableHunter.exhausted).toBe(true);
                expect(context.consularSecurityForce.damage).toBe(5);
                expect(context.reputableHunter.damage).toBe(3);

                // second attack, non-bounty-hunter - goes straight to target resolution since only one legal attacker
                context.consularSecurityForce.damage = 0;
                expect(context.player1).toBeAbleToSelectExactly([context.bountyGuildInitiate, context.consularSecurityForce]);
                expect(context.player1).toHavePassAttackButton();
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.atst.exhausted).toBe(true);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.atst.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
