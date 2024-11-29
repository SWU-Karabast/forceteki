describe('The Zillo Beast, Awoken from the Depths', function() {
    integration(function(contextRef) {
        it('The Zillo Beast\'s when played ability should give all enemy ground units -5/-0 for the phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['the-zillo-beast#awoken-from-the-depths'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst', 'atat-suppressor'],
                    spaceArena: ['cartel-spacer'],
                    hand: ['republic-attack-pod']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theZilloBeast);

            // enemy ground units get -5/-0
            expect(context.atst.getPower()).toBe(1);
            expect(context.atatSuppressor.getPower()).toBe(3);

            // other units unaffected
            expect(context.cartelSpacer.getPower()).toBe(2);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.theZilloBeast.getPower()).toBe(10);

            // new unit is played, doesn't get the debuff
            context.player2.clickCard(context.republicAttackPod);
            expect(context.republicAttackPod.getPower()).toBe(6);

            // move to next action phase, affected units are returned to full power
            context.moveToNextActionPhase();
            expect(context.atst.getPower()).toBe(6);
            expect(context.atatSuppressor.getPower()).toBe(8);
        });

        it('The Zillo Beast\'s triggered ability should heal 5 damage from itself at the start of the regroup phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['the-zillo-beast#awoken-from-the-depths']
                },
                player2: {
                    groundArena: [{ card: 'reinforcement-walker', upgrades: ['entrenched'] }]
                }
            });

            const { context } = contextRef;

            // Zillo Beast attacks upgraded Reinforcement Walker, takes 9 damage
            context.player1.clickCard(context.theZilloBeast);
            context.player1.clickCard(context.reinforcementWalker);

            // Zillo Beast heals at start of regroup phase
            expect(context.theZilloBeast.damage).toBe(9);
            context.moveToRegroupPhase();
            expect(context.theZilloBeast.damage).toBe(4);

            context.player1.clickPrompt('Done');
            context.player2.clickPrompt('Done');

            // defeat Zillo Beast with Reinforcement Walker
            context.player1.clickCard(context.theZilloBeast);
            context.player1.clickCard(context.reinforcementWalker);

            // go to regroup phase to confirm nothing breaks
            context.moveToRegroupPhase();
        });
    });
});
