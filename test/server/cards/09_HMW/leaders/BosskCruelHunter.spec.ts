describe('Bossk, Cruel Hunter', function () {
    integration(function (contextRef) {
        describe('Bossk\'s leader side ability', function () {
            it('should exhaust, heal 1 damage from a damaged enemy unit, and give it a Weakness token', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bossk#cruel-hunter',
                        groundArena: [{ card: 'wampa', damage: 2 }],
                        resources: 4
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bossk);

                expect(context.player1).toHavePrompt('Heal 1 damage from a damaged enemy unit and give a Weakness token to it');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.bossk.exhausted).toBeTrue();
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to exhaust self with no legal targets', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'bossk#cruel-hunter',
                        groundArena: [{ card: 'wampa', damage: 2 }],
                        resources: 4
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickPrompt('Use it anyway');

                expect(context.bossk.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Bossk\'s leader unit side ability', function () {
            it('should deal 2 damage to an enemy unit with a token upgrade on it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#cruel-hunter', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }],
                        resources: 6
                    },
                    player2: {
                        groundArena: [{ card: 'trayus-acolyte', upgrades: ['weakness'] }, { card: 'rebel-pathfinder', upgrades: ['snapshot-reflexes'] }],
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 2 damage to a unit with a token upgrade on it');

                expect(context.player1).toBeAbleToSelectExactly([context.trayusAcolyte, context.battlefieldMarine]);
                context.player1.clickCard(context.trayusAcolyte);

                expect(context.trayusAcolyte.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to an enemy unit with both a token upgrade and a non-token upgrade on it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#cruel-hunter', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }],
                        resources: 6
                    },
                    player2: {
                        groundArena: [{ card: 'trayus-acolyte', upgrades: ['weakness', 'snapshot-reflexes'] }],
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 2 damage to a unit with a token upgrade on it');

                expect(context.player1).toBeAbleToSelectExactly([context.trayusAcolyte, context.battlefieldMarine]);
                context.player1.clickCard(context.trayusAcolyte);

                expect(context.trayusAcolyte.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to an enemy leader unit with a token upgrade on it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }],
                        hand: ['torrent'],
                        leader: { card: 'bossk#cruel-hunter', deployed: true },
                        resources: 6
                    },
                    player2: {
                        groundArena: [{ card: 'trayus-acolyte', upgrades: ['weakness'] }],
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.torrent);
                context.player1.clickCard(context.cadBane);

                context.player2.passAction();

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 2 damage to a unit with a token upgrade on it');

                expect(context.player1).toBeAbleToSelectExactly([context.trayusAcolyte, context.cadBane, context.battlefieldMarine]);
                context.player1.clickCard(context.cadBane);

                expect(context.cadBane.damage).toBe(2);
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to a friendly unit with a token upgrade on it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#cruel-hunter', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['weakness'] }],
                        resources: 6
                    },
                    player2: {
                        groundArena: [{ card: 'trayus-acolyte', upgrades: ['weakness'] }],
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 2 damage to a unit with a token upgrade on it');

                expect(context.player1).toBeAbleToSelectExactly([context.trayusAcolyte, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to a friendly Leader unit with a token upgrade on it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#cruel-hunter', deployed: true },
                        hand: ['torrent'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }],
                        resources: 6
                    },
                    player2: {
                        groundArena: [{ card: 'trayus-acolyte', upgrades: ['weakness'] }],
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.torrent);
                context.player1.clickCard(context.bossk);

                context.player2.passAction();

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Deal 2 damage to a unit with a token upgrade on it');

                expect(context.player1).toBeAbleToSelectExactly([context.trayusAcolyte, context.battlefieldMarine, context.bossk]);
                context.player1.clickCard(context.bossk);

                expect(context.bossk.damage).toBe(2);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow the player to pass the on-attack ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#cruel-hunter', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }],
                        resources: 6
                    },
                    player2: {
                        groundArena: [{ card: 'trayus-acolyte', upgrades: ['weakness'] }],
                        leader: { card: 'cad-bane#still-faster-than-you', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.p2Base);

                context.player1.clickPrompt('Pass');

                expect(context.bossk.damage).toBe(0);
                expect(context.cadBane.damage).toBe(0);
                expect(context.trayusAcolyte.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});