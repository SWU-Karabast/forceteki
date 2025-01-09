describe('Card lasting effects', function() {
    integration(function (contextRef) {
        describe('A card lasting effect with duration "while source is in play" should', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['huyang#enduring-instructor'],
                        groundArena: ['wampa', 'snowspeeder']
                    },
                    player2: {
                        hand: ['vanquish', 'discerning-veteran', 'waylay', 'change-of-heart']
                    }
                });

                const { context } = contextRef;

                // play out Huyang and target Wampa with his effect
                context.player1.clickCard(context.huyang);
                context.player1.clickCard(context.wampa);
            });

            it('have effect while the source is in play and go away when it is defeated', function () {
                const { context } = contextRef;

                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(7);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.huyang);

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('go away when when the source is captured', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.discerningVeteran);
                context.player2.clickCard(context.huyang);

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('expire when the source is returned to hand, and not return if the source comes back into play', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.huyang);

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                // choose snowspeeder as effect target
                context.player1.clickCard(context.huyang);
                context.player1.clickCard(context.snowspeeder);

                // wampa does not have effect, snowspeeder does
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
                expect(context.snowspeeder.getPower()).toBe(5);
                expect(context.snowspeeder.getHp()).toBe(8);
            });

            it('stop affecting the target if it is returned to hand, and not resume if the target comes back into play', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('not cause any error if the target is defeated while under the effect', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);
                expect(context.player1).toBeActivePlayer();
            });

            it('persist across rounds', function () {
                const { context } = contextRef;

                context.moveToNextActionPhase();

                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(7);
            });

            it('persist even if the source changes controllers', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.huyang);

                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(7);
            });
        });

        it('A triggered card lasting effect with duration "while source is in play" should not activate if the source is defeated before the trigger resolves', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['huyang#enduring-instructor'],
                    groundArena: ['wampa'],
                    leader: 'han-solo#worth-the-risk'
                },
                player2: {
                    groundArena: ['supreme-leader-snoke#shadow-ruler']
                }
            });

            const { context } = contextRef;

            // play out Huyang - between Snoke effect and Han damage, he is immediately defeated
            context.player1.clickCard(context.hanSolo);
            context.player1.clickPrompt('Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.');
            context.player1.clickCard(context.huyang);

            // check that the player is never prompted for the trigger since Huyang is defeated by the time it happens
            expect(context.player2).toBeActivePlayer();
        });

        describe('A card lasting effect with duration "while source is in play", when the unique rule is triggered,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['huyang#enduring-instructor', 'huyang#enduring-instructor'],
                        groundArena: ['death-star-stormtrooper', 'wampa'],
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                const [huyangInPlay, huyangInHand] = context.player1.findCardsByName('huyang#enduring-instructor');
                context.huyangInPlay = huyangInPlay;
                context.huyangInHand = huyangInHand;

                // play the first Huyang and put +2/+2 on the Stormtrooper
                context.player1.clickCard(huyangInPlay);
                context.player1.clickCard(context.deathStarStormtrooper);

                // then hit it with Daring Raid so it will die if the Huyang effect is lost
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.deathStarStormtrooper);
            });

            it('should expire before the new effect can resolve if the in-play copy is defeated', function() {
                const { context } = contextRef;

                // play Huyang from hand, defeat the Huyang in play
                context.player1.clickCard(context.huyangInHand);
                context.player1.clickCard(context.huyangInPlay);

                // effect expires before the new one can be applied, so the Stormtrooper dies
                expect(context.deathStarStormtrooper).toBeInZone('discard');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.getPower()).toBe(6);
                expect(context.wampa.getHp()).toBe(7);
            });

            it('should persist if the from-hand copy is defeated', function() {
                const { context } = contextRef;

                // play Huyang from hand, defeat that same Huyang
                context.player1.clickCard(context.huyangInHand);
                context.player1.clickCard(context.huyangInHand);

                // since the new one was defeated, the effect persists and the Stormtrooper lives
                expect(context.deathStarStormtrooper).toBeInZone('groundArena');
            });
        });
    });
});
