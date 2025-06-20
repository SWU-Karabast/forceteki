describe('Anakin Skywalker, Champion of Mortis', function () {
    const heroismPrompt = 'If there a Heroism card in your discard pile, you may give a unit -3/-3 for this phase';
    const villainyPrompt = 'If there a Villainy card in your discard pile, you may give a unit -3/-3 for this phase';

    integration(function (contextRef) {
        it('Anakin Skywalker\'s ability should not allow giving a unit -3/-3 for the phase when there is not a Heroism or Villainy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['anakin-skywalker#champion-of-mortis'],
                    discard: ['escort-skiff'],
                },
                player2: {
                    groundArena: ['wampa'],
                    discard: ['battlefield-marine', 'atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);
            expect(context.player2).toBeActivePlayer();
        });

        it('Anakin Skywalker\'s ability should allow giving a unit -3/-3 for the phase when there is a Heroism unit in discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['anakin-skywalker#champion-of-mortis'],
                    discard: ['luke-skywalker#jedi-knight'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);

            expect(context.player1).toHaveExactPromptButtons([heroismPrompt, `${villainyPrompt} (No effect)`]);

            context.player1.clickPrompt(heroismPrompt);

            expect(context.player1).toBeAbleToSelectExactly([context.anakinSkywalker, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.getPower()).toBe(1);
            expect(context.wampa.getHp()).toBe(2);
        });

        it('Anakin Skywalker\'s ability should allow giving a unit -3/-3 for the phase when there is a Villainy unit in discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['anakin-skywalker#champion-of-mortis'],
                    discard: ['atst'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);

            expect(context.player1).toHaveExactPromptButtons([`${heroismPrompt} (No effect)`, villainyPrompt]);

            context.player1.clickPrompt(villainyPrompt);

            expect(context.player1).toBeAbleToSelectExactly([context.anakinSkywalker, context.wampa]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.getPower()).toBe(1);
            expect(context.wampa.getHp()).toBe(2);
        });

        it('Anakin Skywalker\'s ability should allow giving a unit -3/-3 for the phase when there is a Villainy unit in discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['anakin-skywalker#champion-of-mortis'],
                    discard: ['atst', 'battlefield-marine'],
                },
                player2: {
                    groundArena: ['wampa', 'consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.anakinSkywalker);

            expect(context.player1).toHaveExactPromptButtons([heroismPrompt, villainyPrompt]);

            context.player1.clickPrompt(villainyPrompt);

            expect(context.player1).toBeAbleToSelectExactly([context.anakinSkywalker, context.wampa, context.consularSecurityForce]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.wampa.getPower()).toBe(1);
            expect(context.wampa.getHp()).toBe(2);

            expect(context.player1).toBeAbleToSelectExactly([context.anakinSkywalker, context.wampa, context.consularSecurityForce]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.consularSecurityForce.getPower()).toBe(0);
            expect(context.consularSecurityForce.getHp()).toBe(4);
        });
    });
});
