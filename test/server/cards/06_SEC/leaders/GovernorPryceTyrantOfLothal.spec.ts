describe('Governor Pryce, Tyrant of Lothal', function () {
    integration(function (contextRef) {
        it('Governor Pryce\'s undeployed ability\'s should ready a token unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'governor-pryce#tyrant-of-lothal',
                    hand: ['convene-the-senate'],
                    groundArena: ['battlefield-marine'],
                    base: 'echo-base',
                    resources: 5
                },
                player2: {
                    hand: ['droid-deployment'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Create a Spy token (enters exhausted)
            context.player1.clickCard(context.conveneTheSenate);
            const spies = context.player1.findCardsByName('spy');
            expect(spies.length).toBe(1);
            context.player1.clickPrompt('Take nothing');

            context.player2.clickCard(context.droidDeployment);
            const droids = context.player2.findCardsByName('battle-droid');

            // Use Pryce's action: only token units should be selectable; ready the spy
            context.player1.clickCard(context.governorPryce);
            // Selection should allow only the Spy (token) and not the normal unit
            expect(context.player1).toBeAbleToSelectExactly([...spies, ...droids]);
            context.player1.clickCard(spies[0]);

            expect(spies[0].exhausted).toBeFalse();
            expect(context.governorPryce.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(4);
        });

        describe('Governor Pryce\'s deployed abilities', function () {
            it('on attack: creates a Spy token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'governor-pryce#tyrant-of-lothal', deployed: true },
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.governorPryce);
                context.player1.clickCard(context.p2Base);

                // A Spy token should be created for player1 in ground arena, exhausted
                const spies = context.player1.findCardsByName('spy');
                expect(spies.length).toBe(1);
                expect(spies).toAllBeInZone('groundArena');
                expect(spies[0].exhausted).toBeTrue();
            });

            it('constant: gets +1 power for each ready friendly token unit (updates with readiness)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'governor-pryce#tyrant-of-lothal', deployed: true },
                        hand: ['on-the-doorstep', 'keep-fighting']
                    },
                    player2: {
                        hand: ['drop-in'],
                        groundArena: ['chancellor-palpatine#wartime-chancellor']
                    }
                });

                const { context } = contextRef;

                // 3 ready droid
                context.player1.clickCard(context.onTheDoorstep);

                // 2 ready clone (because of palpatine)
                context.player2.clickCard(context.dropIn);

                const clones = context.player2.findCardsByName('clone-trooper');
                for (const trooper of clones) {
                    expect(trooper.exhausted).toBeFalse();
                }

                context.player1.clickCard(context.governorPryce);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(7); // 4 + 3 droid token
                expect(context.governorPryce.getPower()).toBe(7);

                context.player2.passAction();

                const spy = context.player1.findCardByName('spy');
                context.player1.clickCard(context.keepFighting);
                context.player1.clickCard(spy);

                expect(spy.exhausted).toBeFalse();
                expect(context.governorPryce.getPower()).toBe(8);
            });
        });
    });
});
