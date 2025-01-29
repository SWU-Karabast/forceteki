describe('Nala Se, Clone Engineer', function () {
    integration(function (contextRef) {
        describe('Nala Se\'s leader undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'nala-se#clone-engineer', deployed: true },
                        base: 'echo-base',
                        hand: ['batch-brothers'],
                    },
                    player2: {
                        leader: 'director-krennic#aspiring-to-authority',
                        base: 'kestro-city',
                        hand: ['clone-deserter'],
                        groundArena: ['battlefield-marine'],
                    }
                });
            });

            it('should ignore aspect penalties on friendly Clones', function () {
                const { context } = contextRef;
                const p1ReadyResources = context.player1.readyResourceCount;
                const p2ReadyResources = context.player2.readyResourceCount;

                // Should cost 3 despite a double aspect penalty
                context.player1.clickCard(context.batchBrothers);
                expect(context.player1.readyResourceCount).toBe(p1ReadyResources - 3);

                // Opponent's Clone should cost 5 (1 + two aspect penalties)
                context.player2.clickCard(context.cloneDeserter);
                expect(context.player2.readyResourceCount).toBe(p2ReadyResources - 5);
            });
        });

        describe('Nala Se\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'nala-se#clone-engineer', deployed: true },
                        groundArena: ['pyke-sentinel'],
                        base: { card: 'kestro-city', damage: 6 },
                        hand: ['coruscant-guard', 'sly-moore#secretive-advisor'],
                    },
                    player2: {
                        base: { card: 'echo-base', damage: 5 },
                        groundArena: ['clone-trooper'],
                        hand: ['vanquish', 'takedown', 'daring-raid']
                    }
                });
            });

            it('should ignore aspect penalties on friendly Clones and heal 2 damage when a friendly clone is defeated', function () {
                const { context } = contextRef;
                const readyResources = context.player1.readyResourceCount;

                // Should cost 2 despite an aspect penalty
                context.player1.clickCard(context.coruscantGuard);
                context.player1.clickPrompt('Pass');
                expect(context.player1.readyResourceCount).toBe(readyResources - 2);

                // Heal 2 after Clone dies
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.coruscantGuard);

                expect(context.p1Base.damage).toBe(4);

                // Ensure a non-clone unit doesn't heal
                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.pykeSentinel);
                expect(context.p1Base.damage).toBe(4);

                context.player1.passAction();

                // P2 Clone dying should not heal P2Base
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.cloneTrooper);
                expect(context.p2Base.damage).toBe(5);
            });

            it('should heal off of a stolen clone', function () {
                const { context } = contextRef;
                const readyResources = context.player1.readyResourceCount;

                // Should cost 5, then take control of Clone Trooper
                context.player1.clickCard(context.slyMoore);
                expect(context.player1.readyResourceCount).toBe(readyResources - 5);
                context.player1.clickCard(context.cloneTrooper);

                // P2 kills the stolen Clone Trooper and P1 should heal
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.cloneTrooper);
                expect(context.p1Base.damage).toBe(4);
            });
        });
    });
});
