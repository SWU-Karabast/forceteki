describe('Quinlan Vos, Dark Disciple', () => {
    integration(function (contextRef) {
        describe('Quinlan Vos\'s on attack ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['asajj-ventress#harden-your-heart'],
                        groundArena: [
                            'quinlan-vos#dark-disciple'
                        ],
                        leader: 'kit-fisto#focused-jedi-master',
                        base: 'echo-base',
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    }
                });
            });

            it('allows the player to deal 2 damage to an enemy base if Quinlan Vos has 6 or more power', function () {
                const { context } = contextRef;

                // Player 1 plays Asajj Ventress to give Quinlan Vos +2/+0 for the phase
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.quinlanVos);

                expect(context.quinlanVos.getPower()).toBe(6);
                context.player2.passAction();

                // Attack with Quinlan Vos
                context.player1.clickCard(context.quinlanVos);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHavePrompt('You may deal 2 damage to an enemy base');
                expect(context.player1).toHaveExactPromptButtons(['Pass']);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);

                // Resolve the optional ability to deal 2 damage to the enemy base
                context.player1.clickCard(context.p2Base);

                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('allows the player to pass on the optional ability', function () {
                const { context } = contextRef;

                // Player 1 plays Asajj Ventress to give Quinlan Vos +2/+0 for the phase
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.quinlanVos);

                expect(context.quinlanVos.getPower()).toBe(6);
                context.player2.passAction();

                // Attack with Quinlan Vos
                context.player1.clickCard(context.quinlanVos);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHavePrompt('You may deal 2 damage to an enemy base');
                expect(context.player1).toHaveExactPromptButtons(['Pass']);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);

                // Player chooses to pass on the optional ability
                context.player1.clickPrompt('Pass');

                // Damage is dealt and attack ends
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if Quinlan Vos has less than 6 power', function () {
                const { context } = contextRef;

                // Attack with Quinlan Vos
                context.player1.clickCard(context.quinlanVos);
                context.player1.clickCard(context.p2Base);

                // Damage is dealt and attack ends
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});