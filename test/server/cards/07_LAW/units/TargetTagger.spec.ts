describe('Target Tagger', function() {
    integration(function(contextRef) {
        describe('Target Tagger\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['target-tagger'],
                        groundArena: ['wampa', 'reputable-hunter']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should allow triggering an attack by a unit when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.targetTagger);
                expect(context.targetTagger).toBeInZone('groundArena');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.reputableHunter]);

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.sundariPeacekeeper]);

                context.player1.clickCard(context.sundariPeacekeeper);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.wampa.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(4);
            });

            it('if used with a bounty hunter unit should give it +2 power', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.targetTagger);

                context.player1.clickCard(context.reputableHunter);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);

                // do a second attack to confirm that the +2 bonus has expired
                context.player2.passAction();
                context.readyCard(context.reputableHunter);
                context.player1.clickCard(context.reputableHunter);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.reputableHunter.damage).toBe(1);
                expect(context.sundariPeacekeeper.damage).toBe(3);
            });

            it('should allow the user to pass on the attack at the attacker select stage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.targetTagger);
                expect(context.targetTagger).toBeInZone('groundArena');

                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the user to pass on the attack at the target select stage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.targetTagger);
                expect(context.targetTagger).toBeInZone('groundArena');

                context.player1.clickCard(context.reputableHunter);

                context.player1.clickPrompt('Pass attack');
                expect(context.player2).toBeActivePlayer();
                expect(context.reputableHunter.exhausted).toBe(false);
            });
        });
    });
});