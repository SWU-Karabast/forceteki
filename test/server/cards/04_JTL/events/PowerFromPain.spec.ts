describe('Power From Pain', function() {
    integration(function(contextRef) {
        it('Power From Pain\'s ability should give a unit +1/+0 for each damage on it for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['power-from-pain'],
                    groundArena: [{ card: 'hylobon-enforcer', damage: 3 }, { card: 'wampa', damage: 2 }],
                    spaceArena: ['republic-arc170']
                }, player2: {
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                }
            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.powerFromPain);
            expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer, context.republicArc170, context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.hylobonEnforcer);
            expect(context.hylobonEnforcer.getPower()).toBe(7);
            expect(context.hylobonEnforcer.getHp()).toBe(4);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);

            // Reset hand state
            context.player1.moveCard(context.powerFromPain, 'hand');
            context.player2.passAction();

            // Play the event again
            context.player1.clickCard(context.powerFromPain);
            context.player1.clickCard(context.republicArc170);
            expect(context.republicArc170.getPower()).toBe(3);

            // Move to next phase
            context.moveToNextActionPhase();
            expect(context.hylobonEnforcer.getPower()).toBe(4);
            expect(context.hylobonEnforcer.getHp()).toBe(4);
            expect(context.republicArc170.getPower()).toBe(3);
            expect(context.republicArc170.getHp()).toBe(4);
        });

        it('Power From Pain\'s ability should give a unit +1/+0 for each damage on it for this phase when played even if unit is damaged after the event is played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['power-from-pain'],
                    groundArena: [{ card: 'atst', damage: 3 }],
                    spaceArena: ['republic-arc170']
                }, player2: {
                    hand: ['daring-raid']
                }

            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.powerFromPain);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.republicArc170]);
            context.player1.clickCard(context.atst);
            expect(context.atst.getPower()).toBe(9);
            expect(context.atst.getHp()).toBe(7);

            // Damage unit is dealt after the event is played, buff should be the same
            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.atst);

            expect(context.atst.getPower()).toBe(9);
            expect(context.atst.getHp()).toBe(7);
            expect(context.atst.damage).toBe(5);
        });
    });
});
