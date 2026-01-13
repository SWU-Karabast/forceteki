describe('Phantom, Spectre Shuttle', function() {
    integration(function(contextRef) {
        describe('Phantom\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['phantom#spectre-shuttle', 'battlefield-marine', 'wing-leader', 'wampa'],
                        leader: 'sabine-wren#galvanized-revolutionary',
                        base: 'echo-base',
                    },
                });
            });

            it('should allow playing a Heroism unit from hand and give it an Experience token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.phantom);
                // cannot select wampa
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wingLeader]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should allow playing a Heroism unit from hand and give it an Experience token (when played should occur after the experience token)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.phantom);
                // cannot select wampa
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wingLeader]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wingLeader);
                expect(context.wingLeader).toBeInZone('spaceArena');
                expect(context.wingLeader).toHaveExactUpgradeNames(['experience']);

                expect(context.player1).toBeAbleToSelectExactly([context.phantom]);
                context.player1.clickCard(context.phantom);

                expect(context.player2).toBeActivePlayer();
                expect(context.phantom).toHaveExactUpgradeNames(['experience', 'experience']);
            });
        });

        it('should not trigger if no Heroism units are available in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['phantom#spectre-shuttle', 'wampa', 'atst'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.phantom);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not trigger if no cards in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['phantom#spectre-shuttle'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.phantom);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
