describe('Finalizer, Might of the First Order', function() {
    integration(function(contextRef) {
        describe('Finalizer\'s when played ability', function () {
            it('allows any number of friendly units to capture another unit in the same arena', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['finalizer#might-of-the-first-order'],
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                    },
                    player2: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine', { card: 'zuckuss#bounty-hunter-for-hire', damage: 6 }, { card: '4lom#bounty-hunter-for-hire', damage: 4 }],
                        spaceArena: ['avenger#hunting-star-destroyer'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.finalizerMightOfTheFirstOrder);

                // Can select any friendly unit
                expect(context.player1).toBeAbleToSelectExactly([context.finalizer, context.cartelSpacer, context.wampa, context.atst, context.idenVersio]);
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(context.cartelSpacer);

                // Cannot select Finalizer anymore because the opponent has only one non-leader space unit in play
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.wampa, context.atst, context.idenVersio]);

                context.player1.clickCard(context.cartelSpacer);

                // Can select Finalizer again because Cartel Spacer has been deselected
                expect(context.player1).toBeAbleToSelectExactly([context.finalizer, context.cartelSpacer, context.wampa, context.atst, context.idenVersio]);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.idenVersio);
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePrompt('Choose a unit to capture with Iden Versio');
                expect(context.player1).toBeAbleToSelectExactly([context.steadfastBattalion, context.battlefieldMarine, context.zuckuss, context._4lom]);
                context.player1.clickCard(context._4lom);

                expect(context.player1).toHavePrompt('Choose a unit to capture with Wampa');
                expect(context.player1).toBeAbleToSelectExactly([context.steadfastBattalion, context.battlefieldMarine, context.zuckuss]);
                context.player1.clickCard(context.zuckuss);

                expect(context.avenger).toBeCapturedBy(context.cartelSpacer);
                expect(context._4lom).toBeCapturedBy(context.idenVersio);
                expect(context.zuckuss).toBeCapturedBy(context.wampa);
            });

            it('does nothing if there are no units to be captured', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['finalizer#might-of-the-first-order'],
                        groundArena: [],
                        spaceArena: ['cartel-spacer'],
                    },
                    player2: {
                        groundArena: ['steadfast-battalion', 'battlefield-marine', 'isb-agent', 'superlaser-technician'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.finalizerMightOfTheFirstOrder);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});