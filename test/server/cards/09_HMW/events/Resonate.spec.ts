describe('Resonate', function() {
    integration(function(contextRef) {
        it('Resonate\'s ability should heal 4 damage from friendly base if a friendly non-leader unit shares a trait with a friendly leader, leader not deployed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resonate'],
                    groundArena: ['criminal-muscle'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    base: { card: 'tarkintown', damage: 5 }

                },
                player2: {
                    groundArena: ['battlefield-marine', { card: 'atst', damage: 3 }],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, damage: 5 },
                    base: { card: 'echo-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resonate);

            expect(context.player1).toBeAbleToSelectExactly([
                context.p1Base,
                context.p2Base,
                context.criminalMuscle,
                context.battlefieldMarine,
                context.atst,
                context.chewbacca
            ]);
            context.player1.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(5);
            expect(context.criminalMuscle.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.atst.damage).toBe(3);
            expect(context.chewbacca.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });

        it('Resonate\'s ability should heal 4 damage from friendly base if a friendly non-leader unit shares a trait with a friendly leader, leader is Darksaber', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resonate'],
                    groundArena: ['criminal-muscle', { card: 'greedo#slow-on-the-draw', upgrades: ['the-darksaber#icon-of-leadership'] }],
                    leader: 'grand-inquisitor#hunting-the-jedi',
                    base: { card: 'tarkintown', damage: 5 }

                },
                player2: {
                    groundArena: ['battlefield-marine', { card: 'atst', damage: 3 }],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, damage: 5 },
                    base: { card: 'echo-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resonate);

            expect(context.player1).toBeAbleToSelectExactly([
                context.p1Base,
                context.p2Base,
                context.criminalMuscle,
                context.battlefieldMarine,
                context.atst,
                context.greedo,
                context.chewbacca
            ]);
            context.player1.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(5);
            expect(context.criminalMuscle.damage).toBe(0);
            expect(context.greedo.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.atst.damage).toBe(3);
            expect(context.chewbacca.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });

        it('Resonate\'s ability should heal 4 damage from enemy base if a friendly non-leader unit shares a trait with a friendly leader, leader not deployed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resonate'],
                    groundArena: ['criminal-muscle'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    base: { card: 'tarkintown', damage: 5 }

                },
                player2: {
                    groundArena: ['battlefield-marine', { card: 'atst', damage: 3 }],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, damage: 5 },
                    base: { card: 'echo-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resonate);

            expect(context.player1).toBeAbleToSelectExactly([
                context.p1Base,
                context.p2Base,
                context.criminalMuscle,
                context.battlefieldMarine,
                context.atst,
                context.chewbacca
            ]);
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(1);
            expect(context.criminalMuscle.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.atst.damage).toBe(3);
            expect(context.chewbacca.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });

        it('Resonate\'s ability should heal 4 damage from non-Leader unit if a friendly non-leader unit shares a trait with a friendly leader, leader not deployed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resonate'],
                    groundArena: ['criminal-muscle'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    base: { card: 'tarkintown', damage: 5 }

                },
                player2: {
                    groundArena: ['battlefield-marine', { card: 'atst', damage: 3 }],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, damage: 5 },
                    base: { card: 'echo-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resonate);

            expect(context.player1).toBeAbleToSelectExactly([
                context.p1Base,
                context.p2Base,
                context.criminalMuscle,
                context.battlefieldMarine,
                context.atst,
                context.chewbacca
            ]);
            context.player1.clickCard(context.atst);

            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(5);
            expect(context.criminalMuscle.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.atst.damage).toBe(0);
            expect(context.chewbacca.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });

        it('Resonate\'s ability should heal 4 damage from leader unit if a friendly non-leader unit shares a trait with a friendly leader, leader not deployed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resonate'],
                    groundArena: ['criminal-muscle'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    base: { card: 'tarkintown', damage: 5 }

                },
                player2: {
                    groundArena: ['battlefield-marine', { card: 'atst', damage: 3 }],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, damage: 5 },
                    base: { card: 'echo-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resonate);

            expect(context.player1).toBeAbleToSelectExactly([
                context.p1Base,
                context.p2Base,
                context.criminalMuscle,
                context.battlefieldMarine,
                context.atst,
                context.chewbacca
            ]);
            context.player1.clickCard(context.chewbacca);

            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(5);
            expect(context.criminalMuscle.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.atst.damage).toBe(3);
            expect(context.chewbacca.damage).toBe(1);

            expect(context.player2).toBeActivePlayer();
        });

        it('Resonate\'s ability should heal 4 damage from friendly base if a friendly non-leader unit shares a trait with a friendly leader, leader deployed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resonate'],
                    groundArena: ['criminal-muscle'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    base: { card: 'tarkintown', damage: 5 }

                },
                player2: {
                    groundArena: ['battlefield-marine', { card: 'atst', damage: 3 }],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, damage: 5 },
                    base: { card: 'echo-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resonate);

            expect(context.player1).toBeAbleToSelectExactly([
                context.p1Base,
                context.p2Base,
                context.criminalMuscle,
                context.cadBane,
                context.battlefieldMarine,
                context.atst,
                context.chewbacca
            ]);
            context.player1.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(5);
            expect(context.criminalMuscle.damage).toBe(0);
            expect(context.cadBane.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.atst.damage).toBe(3);
            expect(context.chewbacca.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });

        it('Resonate\'s ability should do nothing if only the leader is deployed', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resonate'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    base: { card: 'tarkintown', damage: 5 }

                },
                player2: {
                    groundArena: ['battlefield-marine', { card: 'atst', damage: 3 }],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, damage: 5 },
                    base: { card: 'echo-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resonate);
            context.player1.clickPrompt('Play anyway');

            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(5);
            expect(context.cadBane.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.atst.damage).toBe(3);
            expect(context.chewbacca.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });

        it('Resonate\'s ability should do nothing if the friendly unit shares a trait with the enemy leader', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resonate'],
                    groundArena: ['bounty-guild-initiate'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, damage: 5 },
                    base: { card: 'tarkintown', damage: 5 }

                },
                player2: {
                    groundArena: ['battlefield-marine', { card: 'atst', damage: 3 }],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    base: { card: 'echo-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resonate);
            context.player1.clickPrompt('Play anyway');

            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(5);
            expect(context.bountyGuildInitiate.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.atst.damage).toBe(3);
            expect(context.chewbacca.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });

        it('Resonate\'s ability should do nothing if the enemy meets the condition', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['resonate'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true, damage: 5 },
                    base: { card: 'tarkintown', damage: 5 }

                },
                player2: {
                    groundArena: ['bounty-guild-initiate', { card: 'atst', damage: 3 }],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                    base: { card: 'echo-base', damage: 5 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.resonate);
            context.player1.clickPrompt('Play anyway');

            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(5);
            expect(context.bountyGuildInitiate.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.atst.damage).toBe(3);
            expect(context.chewbacca.damage).toBe(5);

            expect(context.player2).toBeActivePlayer();
        });
    });
});