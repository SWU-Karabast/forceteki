describe('Chairman Papanoida, Undaunted Diplomat', function () {
    integration(function (contextRef) {
        const disclosePrompt = 'Disclose :aggression:, :aggression: to create a Spy token';
        describe('Chairman Papanoida, Undaunted Diplomat\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-bargain', 'aggression'],
                        groundArena: ['chairman-papanoida#undaunted-diplomat', 'battlefield-marine', 'chio-fain#fourarmed-slicer'],
                    },
                    player2: {
                        hand: ['strategic-analysis', 'this-is-the-way', 'pillage', 'change-of-heart'],
                        groundArena: ['wampa'],
                        deck: ['sabine-wren#explosives-artist', 'supercommando-squad']
                    }
                });
            });

            it('should trigger disclose and create a Spy if we draw cards during action phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.noBargain);
                // no bargain ask opponent to discard a card
                context.player2.clickCard(context.strategicAnalysis);

                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.aggression
                ]);
                context.player1.clickCard(context.aggression);
                context.player2.clickPrompt('Done');

                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(1);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger disclose and create a Spy if opponent draw cards during action phase', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.strategicAnalysis);

                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.aggression
                ]);
                context.player1.clickCard(context.aggression);
                context.player2.clickPrompt('Done');

                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(1);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();

                expect(context.player1).toBeActivePlayer();
            });

            it('should only give 1 Spy token if opponent draws multiple cards at once during action phase', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.thisIsTheWay);
                context.player2.clickCardInDisplayCardPrompt(context.sabineWren);
                context.player2.clickCardInDisplayCardPrompt(context.supercommandoSquad);
                context.player2.clickPrompt('Done');

                // P1 is prompted to see the revealed cards
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.sabineWren, context.supercommandoSquad]);
                context.player1.clickDone();

                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.aggression
                ]);
                context.player1.clickCard(context.aggression);
                context.player2.clickPrompt('Done');

                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(1);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();

                expect(context.player1).toBeActivePlayer();
            });

            it('should trigger for each players if both players draw cards during action phase simultaneously', function () {
                const { context } = contextRef;

                // Attack with Chio Fain to make each player draw a card
                context.player1.clickCard(context.chioFain);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Both players draw a card');
                context.player1.clickPrompt('Trigger');

                // One trigger per player, choose which one to resolve first
                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                expect(context.player1).toHaveExactPromptButtons([
                    disclosePrompt,
                    disclosePrompt
                ]);

                // Resolve one of the triggers first
                context.player1.clickPrompt(disclosePrompt);
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.aggression
                ]);
                context.player1.clickCard(context.aggression);
                context.player2.clickPrompt('Done');

                // Verify a Spy token was created for player 1
                let spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(1);

                // Resolve the other trigger
                expect(context.player1).toHavePrompt(disclosePrompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.aggression
                ]);
                context.player1.clickCard(context.aggression);
                context.player2.clickPrompt('Done');

                // Verify another Spy token was created for player 1
                spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(2);

                for (const spyToken of spy) {
                    expect(spyToken).toBeInZone('groundArena');
                    expect(spyToken.exhausted).toBeTrue();
                }

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger during regroup phase', function () {
                const { context } = contextRef;

                context.moveToRegroupPhase();
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toHavePrompt('Choose an action');
            });

            it('should be able to be passed', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.thisIsTheWay);
                context.player2.clickCardInDisplayCardPrompt(context.sabineWren);
                context.player2.clickCardInDisplayCardPrompt(context.supercommandoSquad);
                context.player2.clickPrompt('Done');

                // P1 is prompted to see the revealed cards
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.sabineWren, context.supercommandoSquad]);
                context.player1.clickDone();

                expect(context.player1).toHavePrompt(disclosePrompt);
                context.player1.clickPrompt('Choose nothing');

                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(0);

                expect(context.player1).toBeActivePlayer();
            });

            it('should work when the unit has changed control', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.chairmanPapanoidaUndauntedDiplomat);

                context.player1.clickCard(context.noBargain);
                context.player2.clickCard(context.thisIsTheWay);

                expect(context.player2).toHavePrompt(disclosePrompt);
                expect(context.player2).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player2).toBeAbleToSelectExactly([
                    context.pillage,
                    context.strategicAnalysis
                ]);
                context.player2.clickCard(context.pillage);
                context.player2.clickCard(context.strategicAnalysis);
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                const spy = context.player2.findCardsByName('spy');
                expect(spy.length).toBe(1);
                expect(spy[0]).toBeInZone('groundArena');
                expect(spy[0].exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if the hand is empty', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.pillage);
                context.player2.clickPrompt('Opponent discards');

                context.player1.clickCard(context.aggression);
                context.player1.clickCard(context.noBargain);
                context.player1.clickPrompt('Done');

                context.player1.passAction();

                context.player2.clickCard(context.strategicAnalysis);

                context.player1.passAction(); // cannot pass if disclose prompt is up
                const spy = context.player1.findCardsByName('spy');
                expect(spy.length).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});