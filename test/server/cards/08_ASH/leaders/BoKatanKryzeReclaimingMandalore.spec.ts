describe('Bo-Katan Kryze, Reclaiming Mandalore', function() {
    integration(function(contextRef) {
        describe('Deploy action ability', function() {
            it('should not allow deploy when resources + Mandalorian units < 10', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bokatan-kryze#reclaiming-mandalore', exhausted: true },
                        resources: 8,
                        groundArena: ['the-armorer#secrecy-is-our-survival', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                expect(context.bokatanKryze).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should allow deploy when resources + Mandalorian units >= 10 (resources)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bokatan-kryze#reclaiming-mandalore', exhausted: true },
                        resources: 9,
                        groundArena: ['the-armorer#secrecy-is-our-survival']
                    },
                    player2: {
                        groundArena: ['sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                expect(context.bokatanKryze).toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.clickPrompt('Deploy Bo-Katan Kryze');

                expect(context.bokatanKryze.deployed).toBeTrue();
            });

            it('should allow deploy when resources + Mandalorian units >= 10 (Mandalorian units)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bokatan-kryze#reclaiming-mandalore', exhausted: true },
                        resources: 5,
                        groundArena: ['the-armorer#secrecy-is-our-survival', { card: 'wampa', upgrades: ['foundling'] }, 'mandalorian'],
                        spaceArena: ['concord-dawn-interceptors', 'disabling-fang-fighter']
                    },
                });

                const { context } = contextRef;

                expect(context.bokatanKryze).toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.clickPrompt('Deploy Bo-Katan Kryze');

                expect(context.bokatanKryze.deployed).toBeTrue();
            });

            it('should allow deploy when resources + Mandalorian units >= 10 (resources only)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bokatan-kryze#reclaiming-mandalore', exhausted: true },
                        resources: 10,
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                expect(context.bokatanKryze).toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.clickPrompt('Deploy Bo-Katan Kryze');

                expect(context.bokatanKryze.deployed).toBeTrue();
            });
        });

        describe('Leader side action ability', function() {
            it('should create a Mandalorian token when controlling units in both arenas', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bokatan-kryze#reclaiming-mandalore',
                        groundArena: ['the-armorer#secrecy-is-our-survival'],
                        spaceArena: ['xwing']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickPrompt('Create a Mandalorian token');

                expect(context.player2).toBeActivePlayer();
                const mandalorian = context.player1.findCardByName('mandalorian');
                expect(mandalorian).toBeInZone('groundArena');
                expect(mandalorian.exhausted).toBeTrue();

                expect(context.bokatanKryze.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should not create a token when not controlling units in both arenas', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bokatan-kryze#reclaiming-mandalore',
                        groundArena: ['the-armorer#secrecy-is-our-survival']
                    },
                    player2: {
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickPrompt('(No effect) Create a Mandalorian token');
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(() => context.player1.findCardByName('mandalorian')).toThrowError('Could not find any cards matching name mandalorian');

                expect(context.bokatanKryze.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });

        it('Leader unit side constant ability should give +1/+0 to other friendly Mandalorian units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'bokatan-kryze#reclaiming-mandalore', deployed: true },
                    groundArena: ['the-armorer#secrecy-is-our-survival', 'battlefield-marine', 'mandalorian', { card: 'wampa', upgrades: ['foundling'] }],
                    spaceArena: ['disabling-fang-fighter']
                },
                player2: {
                    groundArena: ['sundari-peacekeeper']
                }
            });

            const { context } = contextRef;

            expect(context.bokatanKryze.getPower()).toBe(4);
            expect(context.bokatanKryze.getHp()).toBe(7);

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            expect(context.sundariPeacekeeper.getPower()).toBe(1);
            expect(context.sundariPeacekeeper.getHp()).toBe(5);

            expect(context.mandalorian.getPower()).toBe(3);
            expect(context.mandalorian.getHp()).toBe(2);

            expect(context.theArmorer.getPower()).toBe(6);
            expect(context.theArmorer.getHp()).toBe(5);

            expect(context.wampa.getPower()).toBe(6);
            expect(context.wampa.getHp()).toBe(6);

            expect(context.disablingFangFighter.getPower()).toBe(4);
            expect(context.disablingFangFighter.getHp()).toBe(2);
        });

        describe('Leader unit side on attack ability', function() {
            it('should create a Mandalorian token when attacking with units in both arenas', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bokatan-kryze#reclaiming-mandalore', deployed: true },
                        groundArena: ['the-armorer#secrecy-is-our-survival'],
                        spaceArena: ['xwing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                const mandalorian = context.player1.findCardByName('mandalorian');
                expect(mandalorian).toBeInZone('groundArena');
                expect(mandalorian.exhausted).toBeTrue();
            });

            it('should not create a token when not controlling units in both arenas', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bokatan-kryze#reclaiming-mandalore', deployed: true },
                        groundArena: ['the-armorer#secrecy-is-our-survival']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(() => context.player1.findCardByName('mandalorian')).toThrowError('Could not find any cards matching name mandalorian');
            });
        });
    });
});
