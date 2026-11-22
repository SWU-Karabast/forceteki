describe('Child of Dathomir', function () {
    integration(function (contextRef) {
        it('Child of Dathomir\'s constant ability should give it +2/+0 while controlling 3 units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'child-of-dathomir', 'rebel-pathfinder']
                },
            });

            const { context } = contextRef;

            expect(context.player1).toBeActivePlayer();
            expect(context.childOfDathomir.getPower()).toBe(3);
            expect(context.childOfDathomir.getHp()).toBe(2);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.rebelPathfinder.getHp()).toBe(3);
        });

        it('Child of Dathomir\'s constant ability should give it +2/+0 while controlling more than 3 units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'child-of-dathomir', 'rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom']
                },
            });

            const { context } = contextRef;

            expect(context.player1).toBeActivePlayer();
            expect(context.childOfDathomir.getPower()).toBe(3);
            expect(context.childOfDathomir.getHp()).toBe(2);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.rebelPathfinder.getHp()).toBe(3);
            expect(context.lurkingTiePhantom.getPower()).toBe(2);
            expect(context.lurkingTiePhantom.getHp()).toBe(2);
        });

        it('Child of Dathomir\'s constant ability should not give it +2/+0 if there are 3 units for the opponent and less than 3 for controller', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                    spaceArena: ['lurking-tie-phantom']
                },
                player2: {
                    groundArena: ['child-of-dathomir']
                }
            });

            const { context } = contextRef;

            expect(context.player1).toBeActivePlayer();
            expect(context.childOfDathomir.getPower()).toBe(1);
            expect(context.childOfDathomir.getHp()).toBe(2);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.rebelPathfinder.getHp()).toBe(3);
            expect(context.lurkingTiePhantom.getPower()).toBe(2);
            expect(context.lurkingTiePhantom.getHp()).toBe(2);
        });

        it('Child of Dathomir\'s constant ability should not give it +2/+0 if there are 3 total units in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'rebel-pathfinder'],
                },
                player2: {
                    groundArena: ['child-of-dathomir']
                }
            });

            const { context } = contextRef;

            expect(context.player1).toBeActivePlayer();
            expect(context.childOfDathomir.getPower()).toBe(1);
            expect(context.childOfDathomir.getHp()).toBe(2);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.rebelPathfinder.getHp()).toBe(3);
        });
    });
});