describe('Barriss Offee, Its Only A Matter Of Time', function() {
    integration(function(contextRef) {
        describe('Barriss Offee\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['barriss-offee#its-only-a-matter-of-time', 'luke-skywalker#jedi-knight'],
                    },
                    player2: {
                        groundArena: ['atst', 'wampa'],
                    }
                });
            });

            it('should trigger when opponent declares an attack and allow giving the attacker an Experience token (attacking base)', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacker');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.p1Base.damage).toBe(7);
            });

            it('should trigger when opponent declares an attack and allow giving the attacker an Experience token (attacking a friendly unit)', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.barrissOffee);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(1);
                expect(context.atst.damage).toBe(5);
            });

            it('should not trigger when a friendly unit declares an attack', function () {
                const { context } = contextRef;

                // Player attacks
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickCard(context.p2Base);

                // Barriss should not trigger
                expect(context.player2).toBeActivePlayer();
                expect(context.lukeSkywalker).not.toHaveExactUpgradeNames(['experience']);
            });

            it('should trigger multiple times when opponent attacks multiple times in same phase', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // First opponent attack
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacker');
                context.player1.clickPrompt('Trigger');

                context.player1.passAction();

                // Second opponent attack
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacker');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            });
        });

        it('should trigger multiple times when opponent attacks multiple times in the same action', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['barriss-offee#its-only-a-matter-of-time'],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['attack-run'],
                    spaceArena: ['awing', 'green-squadron-awing'],
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.attackRun);
            context.player2.clickCard(context.awing);
            context.player2.clickCard(context.p1Base);
            expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacker');
            context.player1.clickPrompt('Trigger');

            context.player2.clickCard(context.greenSquadronAwing);
            context.player2.clickCard(context.p1Base);
            expect(context.player1).toHavePassAbilityPrompt('Give an Experience token to the attacker');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeActivePlayer();
            expect(context.awing).toHaveExactUpgradeNames(['experience']);
            expect(context.greenSquadronAwing).toHaveExactUpgradeNames(['experience']);
        });
    });
});
