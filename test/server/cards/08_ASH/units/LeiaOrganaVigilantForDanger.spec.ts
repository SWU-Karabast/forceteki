describe('Leia Organa, Vigilant For Danger', function() {
    integration(function(contextRef) {
        describe('Leia\'s On Attack ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['leia-organa#vigilant-for-danger'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should deal 1 damage to herself and heal 2 damage from base when triggered', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to this unit to heal 2 damage from your base');
                context.player1.clickPrompt('Trigger');

                expect(context.leiaOrgana.damage).toBe(1);
                expect(context.p1Base.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow passing the ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to this unit to heal 2 damage from your base');
                context.player1.clickPrompt('Pass');

                expect(context.leiaOrgana.damage).toBe(0);
                expect(context.p1Base.damage).toBe(5);

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Leia\'s Support ability should deal 1 damage to attacker and heal 2 damage from base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leia-organa#vigilant-for-danger'],
                    spaceArena: ['awing'],
                    base: { card: 'echo-base', damage: 5 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.leiaOrgana);
            context.player1.clickCard(context.awing);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to this unit to heal 2 damage from your base');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();

            expect(context.leiaOrgana.damage).toBe(0);
            expect(context.awing.damage).toBe(1);
            expect(context.p1Base.damage).toBe(3);
        });
    });
});
