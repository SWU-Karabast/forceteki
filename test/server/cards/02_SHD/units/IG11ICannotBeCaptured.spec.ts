describe('IG-11, I Cannot Be Captured', function() {
    integration(function(contextRef) {
        describe('IG-11\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['ig11#i-cannot-be-captured', 'wampa'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should deal to a damaged ground unit', function () {
                const { context } = contextRef;

                // CASE 1: no damage on any unit, so no option to target
                context.player1.clickCard(context.ig11);
                context.player1.clickCard(context.p2Base);

                expect(context.ig11.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();
                context.setDamage(context.p2Base, 0);
                context.ig11.exhausted = false;

                // CASE 2: ground unit is damaged so select it
                context.setDamage(context.rebelPathfinder, 2);
                context.setDamage(context.wampa, 1);
                context.setDamage(context.cartelSpacer, 1);
                context.setDamage(context.ig11, 1);
                context.player1.clickCard(context.ig11);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rebelPathfinder, context.ig11]);
                context.player1.clickCard(context.wampa);

                expect(context.ig11.damage).toBe(1);
                expect(context.wampa.damage).toBe(4);
                expect(context.cartelSpacer.damage).toBe(1);
                expect(context.rebelPathfinder.damage).toBe(2);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('IG-11\'s on capture ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['rebel-pathfinder', 'bounty-hunter-crew'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['relentless-pursuit']
                    },
                    player2: {
                        groundArena: ['ig11#i-cannot-be-captured', 'wampa'],

                    }
                });
            });

            it('should deal to 3 damage to each enemeny ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentlessPursuit);
                context.player1.clickCard(context.bountyHunterCrew);
                context.player1.clickCard(context.ig11);
                expect(context.ig11).toBeInZone('discard');
                expect(context.wampa.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.rebelPathfinder).toBeInZone('discard');
                expect(context.bountyHunterCrew.damage).toBe(3);
                expect(context.p2Base.damage).toBe(0);
            });
        });

        describe('IG-11\'s on capture ability still triggers iden\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['rebel-pathfinder', 'bounty-hunter-crew'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['relentless-pursuit'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 5 }
                    },
                    player2: {
                        groundArena: ['ig11#i-cannot-be-captured', 'wampa'],

                    }
                });
            });

            it('should deal to 3 damage to each enemeny ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentlessPursuit);
                context.player1.clickCard(context.bountyHunterCrew);
                context.player1.clickCard(context.ig11);
                expect(context.ig11).toBeInZone('discard');
                expect(context.wampa.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.rebelPathfinder).toBeInZone('discard');
                expect(context.bountyHunterCrew.damage).toBe(3);
                expect(context.idenVersio.damage).toBe(3); // Doesn't set Iden up with a shield
                expect(context.p1Base.damage).toBe(4);
            });
        });

        describe('IG-11\'s on capture ability still triggers when defeated ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bounty-hunter-crew', 'oomseries-officer'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['relentless-pursuit']
                    },
                    player2: {
                        groundArena: ['ig11#i-cannot-be-captured', 'wampa'],

                    }
                });
            });

            it('should deal to 3 damage to each enemeny ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.relentlessPursuit);
                context.player1.clickCard(context.bountyHunterCrew);
                context.player1.clickCard(context.ig11);
                expect(context.ig11).toBeInZone('discard');
                expect(context.wampa.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.oomseriesOfficer).toBeInZone('discard');
                expect(context.bountyHunterCrew.damage).toBe(3);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });
        });

        describe('IG-11\'s on capture ability still triggers when defeated ability and Iden\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bounty-hunter-crew', 'oomseries-officer'],
                        spaceArena: ['cartel-spacer'],
                        hand: ['relentless-pursuit'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true }
                    },
                    player2: {
                        groundArena: ['ig11#i-cannot-be-captured', 'wampa'],

                    }
                });
            });

            it('should deal to 3 damage to each enemeny ground unit', function () {
                const { context } = contextRef;

                context.setDamage(context.p1Base, 5);
                context.player1.clickCard(context.relentlessPursuit);
                context.player1.clickCard(context.bountyHunterCrew);
                context.player1.clickCard(context.ig11);

                expect(context.player1).toHaveEnabledPromptButton('When an opponent\'s unit is defeated, heal 1 from base');
                expect(context.player1).toHaveEnabledPromptButton('Deal 2 damage to a base.');
                context.player1.clickPrompt('When an opponent\'s unit is defeated, heal 1 from base');
                expect(context.p1Base.damage).toBe(4);

                context.player1.clickCard(context.p2Base);
                expect(context.ig11).toBeInZone('discard');
                expect(context.wampa.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.oomseriesOfficer).toBeInZone('discard');
                expect(context.bountyHunterCrew.damage).toBe(3);
                expect(context.idenVersio.damage).toBe(3); // Doesn't set Iden up with a shield
                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});
