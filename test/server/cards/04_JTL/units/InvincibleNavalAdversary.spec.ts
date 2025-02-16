describe('Invincible, Naval Adversary', function () {
    integration(function (contextRef) {
        it('Invincible\'s ability should cost 1 resource less if we control a separatist unit', function () {
            contextRef.setupTest({
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
            expect(context.player1.exhaustedResourceCount).toBe(5);
        });

        it('Invincible\'s ability should not cost 1 resource less if opponent controls a separatist unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['invincible#naval-adversary'],
                    leader: 'jango-fett#concealing-the-conspiracy'
                },
                player2: {
                    groundArena: ['oomseries-officer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.invincible);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(6);
        });

        it('Invincible\'s ability should not cost 1 resource less if there isn\'t separatist unit', function () {
            contextRef.setupTest({
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

        it('Invincible\'s ability should return to hand an enemy non-leader unit which cost 3 or less when my leader is deployed', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    spaceArena: ['invincible#naval-adversary'],
                    leader: 'jango-fett#concealing-the-conspiracy'
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.jangoFett);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.player2).toBeActivePlayer();
            expect(context.lurkingTiePhantom).toBeInZone('hand');
        });

        it('Invincible\'s ability should not trigger when opponent leader deploy', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    spaceArena: ['invincible#naval-adversary'],
                },
                player2: {
                    groundArena: ['wampa', 'battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom'],
                    leader: 'jango-fett#concealing-the-conspiracy'
                }
            });

            const { context } = contextRef;

            context.player1.passAction();

            context.player2.clickCard(context.jangoFett);

            expect(context.player1).toBeActivePlayer();
        });
    });
});
