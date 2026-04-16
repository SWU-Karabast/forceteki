describe('Luke Skywalker, I Can Save Him', function() {
    integration(function(contextRef) {
        describe('Leader side triggered ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#i-can-save-him',
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 2 }]
                    }
                });
            });

            it('exhausts Luke to heal 1 damage from the attacking unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust Luke Skywalker to heal 1 damage from Battlefield Marine');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.lukeSkywalker.exhausted).toBeTrue();
                expect(context.battlefieldMarine.damage).toBe(1);
            });

            it('should not exhaust Luke if the unit die with attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.lukeSkywalker.exhausted).toBeFalse();
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);
                expect(context.wampa).toBeInZone('discard', context.player2);
            });

            it('can be passed without exhausting', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust Luke Skywalker to heal 1 damage from Battlefield Marine');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.lukeSkywalker.exhausted).toBeFalse();
                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('does not trigger when opponent units attack', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                // Opponent's unit attacked, Luke's ability does not trigger
                expect(context.lukeSkywalker.exhausted).toBeFalse();
                expect(context.player1).toBeActivePlayer();
                expect(context.wampa.damage).toBe(2);
            });
        });

        describe('Leader unit side triggered ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'luke-skywalker#i-can-save-him', deployed: true, damage: 3 },
                        spaceArena: [{ card: 'awing', damage: 1 }],
                        groundArena: ['battlefield-marine', 'atst'],
                        base: { card: 'dagobah-swamp', damage: 5 }

                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 4 }]
                    }
                });
            });

            it('heals 2 damage from itself when attacking', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Heal 2 damage from Luke Skywalker or from your base');
                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.p1Base]);

                context.player1.clickCard(context.lukeSkywalker);

                expect(context.lukeSkywalker.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should can heal 2 damage from undamaged unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Heal 2 damage from AT-ST or from your base');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.p1Base]);

                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(0);
            });

            it('heals 2 damage from itself when attacking (space units)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Heal 2 damage from A-Wing or from your base');
                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.p1Base]);

                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing.damage).toBe(0);
            });

            it('should not target attacker if he dies', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Heal 2 damage from Battlefield Marine or from your base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base]);

                context.player1.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('heals 2 damage from itself when attacking (attacking units)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePrompt('Heal 2 damage from AT-ST or from your base');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.p1Base]);

                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(2);
            });

            it('heals 2 damage from base when attacking', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Heal 2 damage from Luke Skywalker or from your base');
                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.p1Base]);

                context.player1.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('heals 2 damage from itself when attacking (trigger multiple times)', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.p1Base]);
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(3);

                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.p1Base]);
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(1);

                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.p1Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(0);
            });
        });
    });
});
