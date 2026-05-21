describe('Single Reactor Ignition', function() {
    integration(function(contextRef) {
        describe('Single Reactor Ignition\' ability', function() {
            it('should defeat all units and deal damage to the enemy base for each defeated unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['single-reactor-ignition'],
                        groundArena: ['atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.singleReactorIgnition);
                expect(context.atst).toBeInZone('discard');
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.allianceXwing).toBeInZone('discard');
                expect(context.bobaFett).toBeInZone('base');
                expect(context.lukeSkywalker).toBeInZone('base');

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(3); // Wampa, Alliance X-Wing, Luke

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Single Reactor Ignition to defeat AT-ST, Wampa, Boba Fett, Luke Skywalker, Cartel Spacer, and Alliance X-Wing',
                    'player1 uses Single Reactor Ignition to deal 3 damage to player2\'s base',
                ]);
            });

            it('should not deal damage for an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['single-reactor-ignition']
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['nimble-prowess'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.singleReactorIgnition);
                expect(context.wampa).toBeInZone('discard');
                expect(context.nimbleProwess).toBeInZone('discard');

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1); // Wampa
            });

            it('should not deal damage for a pilot unit that was an upgrade', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['single-reactor-ignition']
                    },
                    player2: {
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['indoctrinated-conscript'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.singleReactorIgnition);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.indoctrinatedConscript).toBeInZone('discard');

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1); // Cartel Spacer
            });

            it('should not deal damage for a unit that is not actually defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['single-reactor-ignition']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['lurking-tie-phantom']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.singleReactorIgnition);
                expect(context.wampa).toBeInZone('discard');
                expect(context.lurkingTiePhantom).toBeInZone('spaceArena');

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1); // Wampa

                expect(context.getChatLogs(3)).toEqual([
                    'player1 plays Single Reactor Ignition to defeat Wampa and Lurking TIE Phantom',
                    'player2 uses Lurking TIE Phantom to cancel the effects of Single Reactor Ignition',
                    'player1 uses Single Reactor Ignition to deal 1 damage to player2\'s base',
                ]);
            });
        });
    });
});
