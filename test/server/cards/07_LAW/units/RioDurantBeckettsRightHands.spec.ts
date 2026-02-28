describe('Rio Durant, Beckett\'s Right Hands', function() {
    integration(function(contextRef) {
        describe('Rio Durant\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rio-durant#becketts-right-hands'],
                        groundArena: ['battlefield-marine', 'yoda#old-master', 'wampa', 'doctor-evazan#wanted-on-twelve-systems'],
                        leader: 'chewbacca#walking-carpet',
                        base: 'mount-tantiss'
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['awing']
                    }
                });
            });

            it('should return a friendly unit to hand and play it for free with Shielded', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rioDurant);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.battlefieldMarine, context.awing, context.doctorEvazan]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
                expect(context.player1).toHavePassAbilityPrompt('Play Battlefield Marine for free. It gains Shielded for this phase');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(context.player1.exhaustedResourceCount).toBe(4); // cost of Rio Durant
            });

            it('should return a friendly unit to hand and the controller can choose not to play it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rioDurant);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.battlefieldMarine, context.awing, context.doctorEvazan]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
                expect(context.player1).toHavePassAbilityPrompt('Play Battlefield Marine for free. It gains Shielded for this phase');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(4); // cost of Rio Durant
            });

            it('should be able to pass the ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rioDurant);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.battlefieldMarine, context.awing, context.doctorEvazan]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(4); // cost of Rio Durant
            });

            it('should return a unit that has Shielded keyword and play it again', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rioDurant);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.battlefieldMarine, context.awing, context.doctorEvazan]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.doctorEvazan);
                expect(context.doctorEvazan).toBeInZone('hand', context.player1);
                expect(context.player1).toHavePassAbilityPrompt('Play Doctor Evazan for free. It gains Shielded for this phase');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.doctorEvazan).toBeInZone('groundArena', context.player1);
                expect(context.doctorEvazan).toHaveExactUpgradeNames(['shield']);
                expect(context.player1.exhaustedResourceCount).toBe(4); // cost of Rio Durant
            });

            it('should return an opponent-controlled but friendly-owned unit to its owner\'s hand and let them play it for free with Shielded', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rioDurant);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.battlefieldMarine, context.awing, context.doctorEvazan]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.awing);
                expect(context.awing).toBeInZone('hand', context.player2);
                expect(context.player2).toHavePassAbilityPrompt('Play A-Wing for free. It gains Shielded for this phase');
                context.player2.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('spaceArena', context.player2);
                expect(context.awing).toHaveExactUpgradeNames(['shield']);
                expect(context.player1.exhaustedResourceCount).toBe(4); // cost of Rio Durant
                expect(context.player2.exhaustedResourceCount).toBe(0);
            });

            it('should return an opponent unit to its owner\'s hand and let them choose not to play it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rioDurant);
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.battlefieldMarine, context.awing, context.doctorEvazan]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.awing);
                expect(context.awing).toBeInZone('hand', context.player2);
                expect(context.player2).toHavePassAbilityPrompt('Play A-Wing for free. It gains Shielded for this phase');
                context.player2.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('hand', context.player2);
                expect(context.player1.exhaustedResourceCount).toBe(4); // cost of Rio Durant
                expect(context.player2.exhaustedResourceCount).toBe(0);
            });
        });

        it('Rio Durant\'s ability should return a friendly-owned unit controlled by the opponent to hand and then the owner can play it for free with Shielded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rio-durant#becketts-right-hands'],
                    groundArena: ['battlefield-marine'],
                    leader: 'chewbacca#walking-carpet',
                    base: 'mount-tantiss'
                },
                player2: {
                    hand: ['traitorous'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.traitorous);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);

            context.player1.clickCard(context.rioDurant);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickPrompt('Trigger');
            context.player1.clickPrompt('You');

            expect(context.player2).toBeActivePlayer();
            expect(context.traitorous).toBeInZone('discard', context.player2);
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.player1.exhaustedResourceCount).toBe(4); // cost of Rio Durant
        });

        it('Rio Durant\'s ability and DJ leader\'s ability should play Rio for 1 resource less and replay the captor freely with Shielded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rio-durant#becketts-right-hands'],
                    groundArena: ['battlefield-marine'],
                    leader: 'dj#need-a-lift',
                    base: 'colossus',
                    resources: 3
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dj);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.rioDurant);

            expect(context.rioDurant).toBeCapturedBy(context.battlefieldMarine);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toHavePassAbilityPrompt('Play Battlefield Marine for free. It gains Shielded for this phase');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.rioDurant).toBeInZone('groundArena', context.player1);
        });
    });
});
