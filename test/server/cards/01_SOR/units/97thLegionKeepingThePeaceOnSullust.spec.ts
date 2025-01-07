describe('97th Legion Keeping the Peace on Sullust', function() {
    integration(function(contextRef) {
        describe('97th Legion\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['97th-legion#keeping-the-peace-on-sullust', 'wampa'],
                        resources: 7,
                        hand: ['resupply'],
                    },
                });
            });

            it('should give +1/+1 for each resource of the controller', function () {
                const { context } = contextRef;

                expect(context._97thLegion.getPower()).toBe(7);
                expect(context._97thLegion.getHp()).toBe(7);

                // check that friendly unit doesn't get the buff
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                context.player1.clickCard('resupply');

                expect(context.player1.resources.length).toBe(8);

                expect(context._97thLegion.getPower()).toBe(8);
                expect(context._97thLegion.getHp()).toBe(8);
            });
        });

        describe('97th Legion\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: '97th-legion#keeping-the-peace-on-sullust', damage: 5 }],
                        resources: ['superlaser-technician', 'battlefield-marine', 'wild-rancor', 'protector', 'devotion', 'restored-arc170'],
                        hand: ['wrecker#boom'],
                        leader: 'sabine-wren#galvanized-revolutionary'
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });
            });

            it('should defeat 97th legion if a resource is destroyed and damage is equal to current hp', function () {
                const { context } = contextRef;

                expect(context._97thLegion.getPower()).toBe(6);
                expect(context._97thLegion.getHp()).toBe(6);

                context.player1.clickCard(context.wrecker);

                // select a resource to defeat by wreckers ability
                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.battlefieldMarine, context.wildRancor, context.protector, context.devotion, context.restoredArc170]);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.clickCard(context.devotion);

                // select a ground unit to deal 5 damage, 97th legion should be in discard pile already
                expect(context.player1).toBeAbleToSelectExactly([context.wrecker, context.atst]);
                expect(context._97thLegion).toBeInZone('discard');
                context.player1.clickCard(context.atst);

                expect(context.player1.resources.length).toBe(5);
                expect(context.devotion).toBeInZone('discard');
                expect(context.atst.damage).toBe(5);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
