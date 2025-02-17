describe('Invincible, Naval Adversary', function () {
    integration(function (contextRef) {
        it('Invincible\'s ability should cost 1 resource less if we control a unique separatist unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['invincible#naval-adversary'],
                    groundArena: ['count-dooku#darth-tyranus'],
                    leader: 'jango-fett#concealing-the-conspiracy'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.invincible);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(5);
        });

        it('Invincible\'s ability should not cost 1 resource less if we do not control a unique separatist unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['invincible#naval-adversary'],
                    groundArena: ['oomseries-officer'],
                    leader: 'jango-fett#concealing-the-conspiracy'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.invincible);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        it('Invincible\'s ability should not cost 1 resource less if opponent controls a separatist unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['invincible#naval-adversary'],
                    leader: 'jango-fett#concealing-the-conspiracy'
                },
                player2: {
                    groundArena: ['count-dooku#darth-tyranus'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.invincible);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        it('Invincible\'s ability should not cost 1 resource less if there isn\'t separatist unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['invincible#naval-adversary'],
                    groundArena: ['battlefield-marine'],
                    leader: 'jango-fett#concealing-the-conspiracy'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.invincible);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        describe('Invincible\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['invincible#naval-adversary'],
                        leader: 'jango-fett#concealing-the-conspiracy',
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['lurking-tie-phantom'],
                        leader: 'boba-fett#collecting-the-bounty'
                    }
                });
            });

            it('should return to hand an enemy non-leader unit which cost 3 or less when my leader is deployed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jangoFett);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.player2).toBeActivePlayer();
                expect(context.lurkingTiePhantom).toBeInZone('hand');
            });

            it('should not trigger when opponent leader deploy', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.bobaFett);

                expect(context.player1).toBeActivePlayer();
                expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
                expect(context.battlefieldMarine).toBeInZone('groundArena');
            });
        });
    });
});
