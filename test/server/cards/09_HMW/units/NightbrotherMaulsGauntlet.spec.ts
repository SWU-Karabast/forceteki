describe('Nightbrother, Maul\'s Gauntlet', function () {
    integration(function (contextRef) {
        describe('Nightbrother\'s when played ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nightbrother#mauls-gauntlet'],
                        discard: ['wampa', 'superlaser-technician', 'protector', 'mastery'],
                        base: 'jabbas-palace',
                        leader: 'maul#a-rival-in-darkness',
                    },
                    player2: {
                        groundArena: ['atst'],
                        discard: ['battlefield-marine']
                    }
                });
            });

            it('should play a unit from discard for 3 less, entering ready, and defeat it at the next regroup phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nightbrother);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.superlaserTechnician]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(8);
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.wampa.exhausted).toBeFalse();

                context.moveToRegroupPhase();
                expect(context.wampa).toBeInZone('discard');
            });

            it('should play a unit from discard for 3 less, entering ready, do not defeat it at the next regroup phase if unit is already defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nightbrother);
                context.player1.clickCard(context.superlaserTechnician);

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.superlaserTechnician);

                expect(context.player1).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeActivePlayer();
                expect(context.superlaserTechnician).toBeInZone('resource', context.player1);

                context.moveToRegroupPhase();

                expect(context.superlaserTechnician).toBeInZone('resource', context.player1);
            });

            it('should do nothing if passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nightbrother);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.wampa).toBeInZone('discard');

                context.player2.passAction();
            });
        });

        describe('Nightbrother\'s when played ability, playing a copy of a unique unit that is already in play,', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nightbrother#mauls-gauntlet'],
                        groundArena: ['chopper#metal-menace'],
                        discard: ['chopper#metal-menace'],
                    },
                });

                const { context } = contextRef;
                const choppers = context.player1.findCardsByName('chopper#metal-menace');
                context.chopperInPlay = choppers.find((chopper) => chopper.zoneName === 'groundArena');
                context.chopperInDiscard = choppers.find((chopper) => chopper.zoneName === 'discard');
            });

            it('should not throw at the regroup phase when the unique rule defeated the copy that was just played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nightbrother);
                context.player1.clickCard(context.chopperInDiscard);

                expect(context.player1).toHavePrompt('Choose which copy of Chopper, Metal Menace to defeat');
                context.player1.clickCard(context.chopperInDiscard);
                expect(context.chopperInDiscard).toBeInZone('discard');
                expect(context.chopperInPlay).toBeInZone('groundArena');

                // the delayed defeat was applied to a card that has already left play: nothing is left to defeat
                context.moveToRegroupPhase();

                expect(context.chopperInDiscard).toBeInZone('discard');
                expect(context.chopperInPlay).toBeInZone('groundArena');
            });

            it('should still defeat the copy that was just played at the regroup phase when the other copy was defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nightbrother);
                context.player1.clickCard(context.chopperInDiscard);

                expect(context.player1).toHavePrompt('Choose which copy of Chopper, Metal Menace to defeat');
                context.player1.clickCard(context.chopperInPlay);
                expect(context.chopperInPlay).toBeInZone('discard');
                expect(context.chopperInDiscard).toBeInZone('groundArena');

                context.moveToRegroupPhase();

                expect(context.chopperInDiscard).toBeInZone('discard');
            });
        });
    });
});
