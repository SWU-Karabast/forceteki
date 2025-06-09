describe('Anakin Skywalker, Tempted by the Dark Side', function() {
    integration(function (contextRef) {
        describe('Anakin Skywalker\'s Leader side ability', function () {
            it('Anakin Skywalker\'s ability should do nothing without the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#tempted-by-the-dark-side',
                        base: 'kestro-city',
                        hand: ['power-of-the-dark-side', 'confiscate'],
                        hasForceToken: false,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                expect(context.anakinSkywalker).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('Anakin Skywalker\'s ability should exhaust and spend the Force if no card can be played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#tempted-by-the-dark-side',
                        base: 'kestro-city',
                        hand: ['power-of-the-dark-side', 'confiscate'],
                        hasForceToken: true,
                        resources: 2
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                expect(context.anakinSkywalker.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('Anakin Skywalker\'s ability should be allowed to choose nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#tempted-by-the-dark-side',
                        base: 'kestro-city',
                        hand: ['rebel-pathfinder', 'battlefield-marine', 'pyke-sentinel', 'power-of-the-dark-side'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Choose nothing');
                expect(context.anakinSkywalker.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });

            it('Anakin Skywalker\'s ability should not be allowed to choose heroism cards or villainy units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#tempted-by-the-dark-side',
                        base: 'kestro-city',
                        hand: ['rebel-pathfinder', 'battlefield-marine', 'pyke-sentinel', 'power-of-the-dark-side'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toBeAbleToSelectExactly([context.powerOfTheDarkSide]);
                context.player1.clickCard(context.powerOfTheDarkSide);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('Anakin Skywalker\'s ability should allow him to play a villainy event without aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#tempted-by-the-dark-side',
                        base: 'kestro-city',
                        hand: ['power-of-the-dark-side'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.powerOfTheDarkSide);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('Anakin Skywalker\'s ability should allow him to play a villainy upgrade without aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#tempted-by-the-dark-side',
                        base: 'kestro-city',
                        groundArena: ['wampa'],
                        hand: ['brutal-traditions'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.brutalTraditions);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.brutalTraditions).toBeAttachedTo(context.wampa);
            });

            it('Anakin Skywalker\'s ability should allow him to play a villainy pilot (only as a pilot) without aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#tempted-by-the-dark-side',
                        base: 'kestro-city',
                        spaceArena: ['tie-advanced'],
                        hand: ['iden-versio#adapt-or-die'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickCard(context.idenVersio);
                context.player1.clickCard(context.tieAdvanced);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.idenVersio).toBeAttachedTo(context.tieAdvanced);
            });

            it('Anakin Skywalker\'s ability should not be allowed to choose a villainy pilot with no vehicles in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#tempted-by-the-dark-side',
                        base: 'kestro-city',
                        hand: ['iden-versio#adapt-or-die'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');
                expect(context.anakinSkywalker.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Anakin Skywalker\'s deployed ability', function () {
            it('Anakin Skywalker\'s ability should not be able to play a Villainy card from hand without the force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#tempted-by-the-dark-side', deployed: true },
                        base: 'kestro-city',
                        hand: ['power-of-the-dark-side', 'confiscate'],
                        hasForceToken: false,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });

            it('Anakin Skywalker\'s ability should exhaust and spend the Force if no card can be played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#tempted-by-the-dark-side', deployed: true },
                        base: 'kestro-city',
                        hand: ['superlaser-blast', 'confiscate'],
                        hasForceToken: true,
                        resources: 6
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play a Villainy non-unit card from your hand, ignoring its aspect penalties.');
                expect(context.player1).toHaveExactPromptButtons(['Use it anyway', 'Cancel']);
                context.player1.clickPrompt('Use it anyway');

                expect(context.anakinSkywalker.exhausted).toBeFalse();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('Anakin Skywalker\'s ability should be allowed to choose nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#tempted-by-the-dark-side', deployed: true },
                        base: 'kestro-city',
                        hand: ['rebel-pathfinder', 'battlefield-marine', 'pyke-sentinel', 'power-of-the-dark-side'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play a Villainy non-unit card from your hand, ignoring its aspect penalties.');
                context.player1.clickPrompt('Choose nothing');
                expect(context.anakinSkywalker.exhausted).toBeFalse();
                expect(context.player1.hasTheForce).toBeFalse();

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });

            it('Anakin Skywalker\'s ability should not be allowed to choose heroism cards or villainy units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#tempted-by-the-dark-side', deployed: true },
                        base: 'kestro-city',
                        hand: ['rebel-pathfinder', 'battlefield-marine', 'pyke-sentinel', 'power-of-the-dark-side'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play a Villainy non-unit card from your hand, ignoring its aspect penalties.');
                expect(context.player1).toBeAbleToSelectExactly([context.powerOfTheDarkSide]);
                context.player1.clickCard(context.powerOfTheDarkSide);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('Anakin Skywalker\'s ability should allow him to play a villainy event without aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#tempted-by-the-dark-side', deployed: true },
                        base: 'kestro-city',
                        hand: ['power-of-the-dark-side'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play a Villainy non-unit card from your hand, ignoring its aspect penalties.');
                context.player1.clickCard(context.powerOfTheDarkSide);
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('Anakin Skywalker\'s ability should allow him to play a villainy upgrade without aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#tempted-by-the-dark-side', deployed: true },
                        base: 'kestro-city',
                        groundArena: ['wampa'],
                        hand: ['brutal-traditions'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play a Villainy non-unit card from your hand, ignoring its aspect penalties.');
                context.player1.clickCard(context.brutalTraditions);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.brutalTraditions).toBeAttachedTo(context.wampa);
            });

            it('Anakin Skywalker\'s ability should allow him to play a villainy pilot (only as a pilot) without aspect penalties', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#tempted-by-the-dark-side', deployed: true },
                        base: 'kestro-city',
                        spaceArena: ['tie-advanced'],
                        hand: ['iden-versio#adapt-or-die'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play a Villainy non-unit card from your hand, ignoring its aspect penalties.');
                context.player1.clickCard(context.idenVersio);
                context.player1.clickCard(context.tieAdvanced);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.idenVersio).toBeAttachedTo(context.tieAdvanced);
            });

            it('Anakin Skywalker\'s ability should be allowed to use the Force even if no valid targets exist in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'anakin-skywalker#tempted-by-the-dark-side', deployed: true },
                        base: 'kestro-city',
                        hand: ['iden-versio#adapt-or-die'],
                        hasForceToken: true,
                        resources: 4
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.anakinSkywalker);
                context.player1.clickPrompt('Play a Villainy non-unit card from your hand, ignoring its aspect penalties.');
                context.player1.clickPrompt('Use it anyway');
                expect(context.anakinSkywalker.exhausted).toBeFalse();
                expect(context.player1.hasTheForce).toBeFalse();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});