describe('Poggle the Lesser, Let the Executions Begin', function () {
    integration(function (contextRef) {
        it('Poggle the Lesser\'s undeployed ability\'s should ready a creature unit if at least one resource is left', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'poggle-the-lesser#let-the-executions-begin',
                    groundArena: ['hunting-nexu', 'marrok#mysterious-warrior'],
                    base: 'rix-road',
                    resources: 1,
                },
                player2: {
                    groundArena: ['dinosaur-turtle']
                }
            });

            const { context } = contextRef;

            // Use Poggle's action: only token units should be selectable; ready the beast
            context.player1.clickCard(context.poggleTheLesser);
            expect(context.player1).toHavePrompt('Ready a friendly Creature unit and deal 1 damage to it');

            // Selection should allow only the Hunting Nexu and not the Marrok unit
            expect(context.player1).toBeAbleToSelectExactly([
                context.huntingNexu
            ]);
            context.player1.clickCard(context.huntingNexu);

            expect(context.huntingNexu.exhausted).toBeFalse();
            expect(context.poggleTheLesser.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
        it('Poggle the Lesser\'s undeployed ability\'s shouldn\'t ready a creature unit if no resources are left', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'poggle-the-lesser#let-the-executions-begin',
                    groundArena: ['hunting-nexu', 'marrok#mysterious-warrior'],
                    base: 'rix-road',
                    resources: 0,
                },
                player2: {
                    groundArena: ['dinosaur-turtle']
                }
            });

            const { context } = contextRef;

            expect(context.poggleTheLesser).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        describe('Poggle the Lesser\'s When Deployed ability', function () {
            it('on deploy: should create a Beast token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poggle-the-lesser#let-the-executions-begin',
                        resources: 5,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.poggleTheLesser);
                context.player1.clickPrompt('Deploy Poggle the Lesser');

                // A Beast token should be created for player1 in ground arena, exhausted
                const beasts = context.player1.findCardsByName('beast');
                expect(beasts.length).toBe(1);
                expect(beasts).toAllBeInZone('groundArena');
                expect(beasts[0].exhausted).toBeTrue();
            });

            describe('Poggle the Lesser\'s deployed abilities', function () {
                it('on attack: should ready a creature unit and deal 1 damage to it', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: { card: 'poggle-the-lesser#let-the-executions-begin', deployed: true },
                            groundArena: [{ card: 'hunting-nexu', exhausted: true }],
                            resources: 5,
                        },
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.poggleTheLesser);
                    context.player1.clickCard(context.p2Base);

                    // Selection should allow only the Hunting Nexu and not Poggle or the Marrok unit
                    expect(context.player1).toBeAbleToSelectExactly([
                        context.huntingNexu
                    ]);
                    context.player1.clickCard(context.huntingNexu);

                    expect(context.huntingNexu.exhausted).toBeFalse();
                    expect(context.poggleTheLesser.exhausted).toBeTrue();
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                });

                it('on attack: should allow the player to pass the on-attack ability', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: { card: 'poggle-the-lesser#let-the-executions-begin', deployed: true },
                            groundArena: [{ card: 'hunting-nexu', exhausted: true }],
                            resources: 5,
                        },
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.poggleTheLesser);
                    context.player1.clickCard(context.p2Base);

                    // Selection should allow Pass
                    expect(context.player1).toHaveEnabledPromptButton('Pass');
                    context.player1.clickPrompt('Pass');

                    expect(context.huntingNexu.exhausted).toBeTrue();
                    expect(context.poggleTheLesser.exhausted).toBeTrue();

                    expect(context.p2Base.damage).toBe(1);
                    expect(context.player1.exhaustedResourceCount).toBe(0);
                    expect(context.player2).toBeActivePlayer();
                });
            });
        });
    });
});