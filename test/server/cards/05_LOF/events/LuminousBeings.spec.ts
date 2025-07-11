describe('Luminous Beings', function () {
    integration(function (contextRef) {
        describe('Luminous Beings\' ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['luminous-beings'],
                        discard: ['luke-skywalker#jedi-knight', 'obiwan-kenobi#following-fate', 'yoda#old-master', 'aayla-secura#master-of-the-blade', 'battlefield-marine'],
                        groundArena: ['yaddle#a-chance-to-make-things-right', 'wampa', 'swoop-racer'],
                    },
                    player2: {

                        groundArena: ['atst']
                    }
                });
            });

            it('should put up to 3 Force units from discard pile on the bottom of the deck and give that many units +4/+4 for the phase', function () {
                const { context } = contextRef;
                const { player1 } = context;

                player1.clickCard(context.luminousBeings);

                // Select Force units from the discard pile (up to 3)
                expect(player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.obiwanKenobi, context.yoda, context.aaylaSecura]);
                expect(player1).toHaveChooseNothingButton();

                player1.clickCard(context.lukeSkywalker);
                player1.clickCard(context.obiwanKenobi);
                player1.clickCard(context.yoda);
                player1.clickCardNonChecking(context.aaylaSecura);
                player1.clickPrompt('Done');

                // Two units were selected, so we should be able to give +4/+4 to two units
                expect(player1).toBeAbleToSelectExactly([context.yaddle, context.wampa, context.swoopRacer, context.atst]);
                player1.clickCard(context.yaddle);
                player1.clickCard(context.wampa);
                player1.clickCard(context.swoopRacer);
                player1.clickCardNonChecking(context.atst);
                player1.clickPrompt('Done');

                // Verify the units got +4/+4
                expect(context.yaddle.getPower()).toBe(6);
                expect(context.yaddle.getHp()).toBe(8);
                expect(context.wampa.getPower()).toBe(8);
                expect(context.wampa.getHp()).toBe(9);
                expect(context.swoopRacer.getPower()).toBe(8);
                expect(context.swoopRacer.getHp()).toBe(7);

                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);

                // Verify the units were put on the bottom of the deck
                expect([context.lukeSkywalker, context.obiwanKenobi, context.yoda]).toAllBeInBottomOfDeck(player1, 3);
                expect(context.aaylaSecura).toBeInZone('discard', player1);

                context.moveToNextActionPhase();

                // bonus expired
                expect(context.yaddle.getPower()).toBe(2);
                expect(context.yaddle.getHp()).toBe(4);
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
                expect(context.swoopRacer.getPower()).toBe(4);
                expect(context.swoopRacer.getHp()).toBe(3);
            });

            it('should put up to 3 Force units from discard pile on the bottom of the deck and give that many units +4/+4 for the phase (choose less than 3)', function () {
                const { context } = contextRef;
                const { player1 } = context;

                player1.clickCard(context.luminousBeings);

                // Select Force units from the discard pile (up to 3)
                expect(player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.obiwanKenobi, context.yoda, context.aaylaSecura]);
                expect(player1).toHaveChooseNothingButton();

                player1.clickCard(context.lukeSkywalker);
                player1.clickCard(context.obiwanKenobi);
                player1.clickPrompt('Done');

                // Two units were selected, so we should be able to give +4/+4 to two units
                expect(player1).toBeAbleToSelectExactly([context.yaddle, context.wampa, context.swoopRacer, context.atst]);
                player1.clickCard(context.yaddle);
                player1.clickCard(context.wampa);
                player1.clickCardNonChecking(context.swoopRacer);
                player1.clickPrompt('Done');

                // Verify the units got +4/+4
                expect(context.yaddle.getPower()).toBe(6);
                expect(context.yaddle.getHp()).toBe(8);
                expect(context.wampa.getPower()).toBe(8);
                expect(context.wampa.getHp()).toBe(9);
                expect(context.swoopRacer.getPower()).toBe(4);
                expect(context.swoopRacer.getHp()).toBe(3);
            });

            it('should put up to 3 Force units from discard pile on the bottom of the deck and give that many units +4/+4 for the phase (choose 0)', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.clickCard(context.luminousBeings);

                // Select Force units from the discard pile (up to 3)
                expect(player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.obiwanKenobi, context.yoda, context.aaylaSecura]);
                expect(player1).toHaveChooseNothingButton();

                player1.clickPrompt('Choose nothing');

                expect(player2).toBeActivePlayer();

                expect(context.yaddle.getPower()).toBe(2);
                expect(context.yaddle.getHp()).toBe(4);
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
                expect(context.swoopRacer.getPower()).toBe(4);
                expect(context.swoopRacer.getHp()).toBe(3);
            });
        });
    });
});