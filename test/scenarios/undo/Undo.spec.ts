describe('Undo', function() {
    undoIntegration(function(contextRef) {
        describe('Death Trooper\'s When Played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['death-trooper'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa', 'superlaser-technician'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            undoIt('can only target ground units & can damage itself', function () {
                const { context } = contextRef;

                // Play Death Trooper
                context.player1.clickCard(context.deathTrooper);

                // Choose Friendly
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.deathTrooper]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.deathTrooper);

                // Choose Enemy
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.superlaserTechnician]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                expect(context.deathTrooper.damage).toEqual(2);
                expect(context.wampa.damage).toEqual(2);
            });

            undoIt('works when no enemy ground units', function () {
                const { context } = contextRef;

                // Play Death Trooper
                context.player2.setGroundArenaUnits([]);
                context.player1.clickCard(context.deathTrooper);

                // Choose Friendly
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.deathTrooper]);
                expect(context.player1).not.toHavePassAbilityPrompt('Deal 2 damage to a friendly ground unit and an enemy ground unit');
                context.player1.clickCard(context.deathTrooper);
                expect(context.deathTrooper.damage).toEqual(2);
            });
        });

        describe('2-1B Surgical Droid\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: '21b-surgical-droid' },
                            { card: 'r2d2#ignoring-protocol', damage: 3 },
                            { card: 'c3po#protocol-droid', damage: 1 }],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 2 }]
                    }
                });
            });

            undoIt('should heal a target with 1 damage to full', function () {
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context._21bSurgicalDroid);
                expect(context._21bSurgicalDroid).toBeInZone('groundArena');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);
                context.player1.clickCard(context.p2Base);

                // Healing Target
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.c3po, context.wampa]);
                context.player1.clickCard(context.c3po);

                // Confirm Results
                expect(context._21bSurgicalDroid.exhausted).toBe(true);
                expect(context.c3po.damage).toBe(0);
            });

            undoIt('should heal 2 damage from a unit', function () {
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context._21bSurgicalDroid);
                expect(context._21bSurgicalDroid).toBeInZone('groundArena');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);
                context.player1.clickCard(context.p2Base);

                // Healing Target
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.c3po, context.wampa]);
                context.player1.clickCard(context.r2d2);

                // Confirm Results
                expect(context._21bSurgicalDroid.exhausted).toBe(true);
                expect(context.r2d2.damage).toBe(1);
            });

            undoIt('should be able to heal an enemy unit', function () {
                const { context } = contextRef;

                // Attack
                context.player1.clickCard(context._21bSurgicalDroid);
                expect(context.wampa.damage).toBe(2);
                expect(context._21bSurgicalDroid).toBeInZone('groundArena');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.wampa]);
                context.player1.clickCard(context.p2Base);

                // Healing Target
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2, context.c3po, context.wampa]);
                context.player1.clickCard(context.wampa);

                // Confirm Results
                expect(context._21bSurgicalDroid.exhausted).toBe(true);
                expect(context.wampa.damage).toBe(0);
            });

            undoIt('should be able to be passed', function () {
                const { context } = contextRef;

                expect(context.r2d2.damage).toBe(3);
                context.player1.clickCard(context._21bSurgicalDroid);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Pass');
                expect(context._21bSurgicalDroid.exhausted).toBe(true);
                expect(context.r2d2.damage).toBe(3);
            });
        });
    });
});
