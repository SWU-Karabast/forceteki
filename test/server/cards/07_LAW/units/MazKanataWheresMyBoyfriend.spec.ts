describe('Maz Kanata, Where\'s My Boyfriend', function () {
    integration(function (contextRef) {
        describe('Maz Kanata\'s when attacks ends ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        hand: ['second-chance'],
                        groundArena: ['maz-kanata#wheres-my-boyfriend'],
                        deck: ['greedo#slow-on-the-draw', 'syndicate-lackeys', 'cartel-spacer', 'wampa', 'atst', 'yoda#old-master'],
                        base: 'jabbas-palace'
                    },
                    player2: {
                        groundArena: ['the-zillo-beast#awoken-from-the-depths', 'karis#we-dont-like-strangers'],
                        hasForceToken: true,
                    }
                });
            });

            it('should play Underworld unit with 4 resource less and return it to bottom of deck at end of phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.greedo, context.syndicateLackeys, context.cartelSpacer],
                    invalid: [context.wampa, context.atst]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.syndicateLackeys);
                context.player1.clickPrompt('Pass'); // Pass Ambush

                expect(context.player2).toBeActivePlayer();
                expect([context.greedo, context.cartelSpacer, context.wampa, context.atst]).toAllBeInBottomOfDeck(context.player1, 4);
                expect(context.syndicateLackeys).toBeInZone('groundArena', context.player1);
                expect(context.syndicateLackeys.exhausted).toBe(false);
                expect(context.player1.exhaustedResourceCount).toBe(1); // 5 - 4 = 1

                context.player2.passAction();
                context.player1.passAction();

                expect(context.syndicateLackeys).toBeInBottomOfDeck(context.player1, 1);
            });

            it('should not return the played unit if it dies on phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.greedo, context.syndicateLackeys, context.cartelSpacer],
                    invalid: [context.wampa, context.atst]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.syndicateLackeys);

                context.player1.clickPrompt('Trigger'); // trigger Ambush
                context.player1.clickCard(context.theZilloBeast);

                expect(context.player2).toBeActivePlayer();
                expect([context.greedo, context.cartelSpacer, context.wampa, context.atst]).toAllBeInBottomOfDeck(context.player1, 4);

                context.player2.passAction();
                context.player1.passAction();

                expect(context.syndicateLackeys).toBeInZone('discard', context.player1);
            });

            it('should not return the played unit if it dies and be replayed on phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.greedo, context.syndicateLackeys, context.cartelSpacer],
                    invalid: [context.wampa, context.atst]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.syndicateLackeys);
                context.player1.clickPrompt('Pass'); // Pass Ambush

                context.player2.passAction();

                context.player1.clickCard(context.secondChance);
                context.player1.clickCard(context.syndicateLackeys);

                context.player2.passAction();

                context.player1.clickCard(context.syndicateLackeys);
                context.player1.clickCard(context.theZilloBeast); // die

                context.player2.passAction();

                context.player1.clickCard(context.syndicateLackeys); // replay Syndicate Lackeys with Second Chance lasting effect
                context.player1.clickPrompt('Pass'); // Pass Ambush

                context.player2.passAction();
                context.player1.passAction();

                expect(context.syndicateLackeys).toBeInZone('groundArena', context.player1);
            });

            it('should not trigger ability if defeated while attacking', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickCard(context.theZilloBeast);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger ability if defeated by opponent\'s when defeated ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mazKanata);
                context.player1.clickCard(context.karis);

                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                context.player1.clickPrompt('Opponent');

                context.player2.clickPrompt('Trigger');
                context.player2.clickCard(context.mazKanata);

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should not trigger ability if deck is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    groundArena: ['maz-kanata#wheres-my-boyfriend'],
                    deck: [],
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.mazKanata);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });

        it('cannot select Underworld event or Underworld unit with too high cost', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    groundArena: ['maz-kanata#wheres-my-boyfriend'],
                    deck: ['bounty-hunter-crew', 'strafing-gunship', 'cartel-spacer', 'atst', 'ma-klounkee'],
                    resources: 0,
                    base: 'jabbas-palace'
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.mazKanata);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.strafingGunship, context.cartelSpacer],
                invalid: [context.bountyHunterCrew, context.maKlounkee, context.atst]
            });

            context.player1.clickCardInDisplayCardPrompt(context.strafingGunship);

            expect(context.player2).toBeActivePlayer();
            expect(context.strafingGunship).toBeInZone('spaceArena', context.player1);
            expect(context.strafingGunship.exhausted).toBeFalse();
            expect([context.cartelSpacer, context.bountyHunterCrew, context.atst, context.maKlounkee]).toAllBeInBottomOfDeck(context.player1, 4);
        });
    });
});
