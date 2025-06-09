
describe('The Son, Embodiment of Darkness', function() {
    integration(function(contextRef) {
        describe('The Son\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['seventh-sister#implacable-inquisitor'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'the-son#embodiment-of-darkness'],
                        base: { card: 'echo-base', damage: 3 },
                        hasForceToken: true
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder'],
                        hand: ['battlefield-marine'],
                        base: { card: 'echo-base', damage: 3 }
                    }
                });
            });

            it('should give only friendly units +2/+0 when you have the force', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickCard(context.p2Base);
                expect(context.grandInquisitor.getPower()).toBe(5);
                expect(context.p2Base.damage).toBe(9);

                context.player2.clickCard(context.rebelPathfinder);
                context.player2.clickCard(context.p1Base);
                expect(context.rebelPathfinder.getPower()).toBe(2);
                expect(context.p1Base.damage).toBe(5);

                // The Son himself also gets +2/+0
                expect(context.theSon.getPower()).toBe(8);
            });
        });

        it('The Son, Embodiment of Darkness\'s ability should not be active when player doesn\'t have the Force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['seventh-sister#implacable-inquisitor'],
                    groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'the-son#embodiment-of-darkness'],
                    base: { card: 'echo-base', damage: 3 },
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    hand: ['battlefield-marine'],
                    base: { card: 'echo-base', damage: 3 }
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.grandInquisitor);
            context.player1.clickCard(context.p2Base);
            expect(context.grandInquisitor.getPower()).toBe(3);
            expect(context.p2Base.damage).toBe(7);
        });

        it('it becomes active when an on-attack trigger gives the player the Force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['seventh-sister#implacable-inquisitor'],
                    groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'the-son#embodiment-of-darkness'],
                    base: { card: 'shadowed-undercity', damage: 3 },
                },
                player2: {
                    groundArena: ['rebel-pathfinder'],
                    hand: ['battlefield-marine'],
                    base: { card: 'echo-base', damage: 3 }
                },
            });

            const { context } = contextRef;

            // Does not have the Force at the start, and The Son's ability is not active
            expect(context.player1.hasTheForce).toBeFalse();
            expect(context.grandInquisitor.getPower()).toBe(3);

            context.player1.clickCard(context.grandInquisitor);
            context.player1.clickCard(context.p2Base);

            // Player gains the force on-attack, and The Son's ability give the the buff before combat damage is dealt
            expect(context.player1.hasTheForce).toBeTrue();
            expect(context.grandInquisitor.getPower()).toBe(5);
            expect(context.p2Base.damage).toBe(9);
        });
    });
});