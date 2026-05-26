describe('Sabine Wren, I Learned the Hard Way', function() {
    integration(function(contextRef) {
        it('Sabine Wren\'s ability should trigger when an upgrade is attached and allow exhausting a ground unit (friendly upgrade)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['sabine-wren#i-learned-the-hard-way'],
                    hand: ['pointless-to-resist'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.pointlessToResist);
            context.player1.clickCard(context.sabineWren);

            expect(context.player1).toHavePrompt('Exhaust a ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.battlefieldMarine, context.atst]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.sabineWren.exhausted).toBeFalse();
        });

        it('Sabine Wren\'s ability should trigger when an upgrade is attached and allow exhausting a ground unit (friendly token upgrade)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['covering-the-wing'],
                    groundArena: ['sabine-wren#i-learned-the-hard-way'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.coveringTheWing);
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.sabineWren);

            expect(context.player1).toHavePrompt('Exhaust a ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.battlefieldMarine, context.atst]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.sabineWren.exhausted).toBeFalse();
        });

        it('Sabine Wren\'s ability should trigger when an upgrade is attached and allow exhausting a ground unit (multiple friendly token upgrades)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['consumed-by-the-dark-side'],
                    groundArena: ['sabine-wren#i-learned-the-hard-way'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.consumedByTheDarkSide);
            context.player1.clickCard(context.sabineWren);

            expect(context.player1).toHavePrompt('Exhaust a ground unit');
            expect(context.player1).toBeAbleToSelectExactly([context.sabineWren, context.battlefieldMarine, context.atst]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.sabineWren).toHaveExactUpgradeNames(['experience', 'experience']);
            expect(context.battlefieldMarine.exhausted).toBeTrue();
            expect(context.sabineWren.exhausted).toBeFalse();
            expect(context.atst.exhausted).toBeFalse();
            expect(context.awing.exhausted).toBeFalse();
        });

        it('Sabine Wren\'s ability should trigger when an upgrade is attached and allow exhausting a ground unit (multiple time on turn)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['fulcrum', 'mastery'],
                    groundArena: ['sabine-wren#i-learned-the-hard-way'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.fulcrum);
            context.player1.clickCard(context.sabineWren);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.exhausted).toBeTrue();

            context.player2.passAction();

            context.player1.clickCard(context.mastery);
            context.player1.clickCard(context.sabineWren);
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.exhausted).toBeTrue();
        });

        it('Sabine Wren\'s ability should not trigger when an upgrade is attached to another friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mastery'],
                    groundArena: ['sabine-wren#i-learned-the-hard-way', 'yoda#old-master'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.mastery);
            context.player1.clickCard(context.yoda);

            expect(context.player2).toBeActivePlayer();
        });

        it('Sabine Wren\'s ability should not trigger when an upgrade is attached to an enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['sabine-wren#i-learned-the-hard-way'],
                },
                player2: {
                    hand: ['mastery'],
                    groundArena: ['battlefield-marine', 'atst'],
                    spaceArena: ['awing'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.mastery);
            context.player2.clickCard(context.awing);

            expect(context.player1).toBeActivePlayer();
            expect(context.sabineWren.exhausted).toBeFalse();
        });

        it('Sabine Wren\'s ability should trigger when an upgrade is attached to her by opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['sabine-wren#i-learned-the-hard-way'],
                },
                player2: {
                    hand: ['condemn'],
                    groundArena: ['battlefield-marine', 'atst'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.condemn);
            context.player2.clickCard(context.sabineWren);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.atst, context.sabineWren]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.atst.exhausted).toBeTrue();
            expect(context.sabineWren.exhausted).toBeFalse();
        });
    });
});
