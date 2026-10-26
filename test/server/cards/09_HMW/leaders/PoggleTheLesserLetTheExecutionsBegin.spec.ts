describe('Poggle the Lesser, Let the Executions Begin', function () {
    integration(function (contextRef) {
        describe('Undeployed leader action ability', function () {
            it('should ready a creature unit if at least one resource is left', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poggle-the-lesser#let-the-executions-begin',
                        groundArena: [{ card: 'hunting-nexu', exhausted: true }, 'marrok#mysterious-warrior'],
                        base: 'rix-road',
                        resources: 1,
                    },
                    player2: {
                        groundArena: ['dinosaur-turtle']
                    }
                });

                const { context } = contextRef;

                // Use Poggle's action: only friendly Creature units should be selectable
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

            it('shouldn\'t ready a creature unit if no resources are left', async function () {
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

            it('shouldn\'t do anything if no friendly creature units are in play.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poggle-the-lesser#let-the-executions-begin',
                        base: 'rix-road',
                        resources: 1,
                    },
                    player2: {
                        groundArena: ['dinosaur-turtle']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.poggleTheLesser);
                expect(context.player1).toHavePrompt('The ability "Ready a friendly Creature unit and deal 1 damage to it" will have no effect. Are you sure you want to use it?');
                expect(context.player1).toHaveEnabledPromptButton('Use it anyway');
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.poggleTheLesser.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should only deal 1 damage if a friendly creature unit has exhausting upgrade.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poggle-the-lesser#let-the-executions-begin',
                        groundArena: [{ card: 'hunting-nexu', upgrades: ['shadow-of-stygeon-prime'], exhausted: true }],
                        base: 'rix-road',
                        resources: 1,
                    },
                    player2: {
                        groundArena: ['dinosaur-turtle']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.poggleTheLesser);
                expect(context.player1).toHavePrompt('Ready a friendly Creature unit and deal 1 damage to it');

                // Selection should allow only the Hunting Nexu unit
                expect(context.player1).toBeAbleToSelectExactly([
                    context.huntingNexu
                ]);
                context.player1.clickCard(context.huntingNexu);

                expect(context.player2).toBeActivePlayer();
                expect(context.poggleTheLesser.exhausted).toBeTrue();
                expect(context.huntingNexu.exhausted).toBeTrue();
                expect(context.huntingNexu.damage).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('When Deployed ability', function () {
            it('should create a Beast token', async function () {
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
        });

        describe('Deployed On Attack ability', function () {
            it('should ready a creature unit and deal 1 damage to it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'poggle-the-lesser#let-the-executions-begin', deployed: true },
                        groundArena: [{ card: 'hunting-nexu', exhausted: true }, 'marrok#mysterious-warrior'],
                        resources: 5,
                    },
                    player2: {
                        groundArena: ['dinosaur-turtle'],
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

            it('should allow the player to pass the on-attack ability', async function () {
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

            it('should silently be skipped if there are no friendly Creature units in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'poggle-the-lesser#let-the-executions-begin', deployed: true },
                        resources: 5,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.poggleTheLesser);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(1);
            });
        });
    });
});