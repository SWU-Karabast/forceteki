
describe('Cunning', function () {
    integration(function (contextRef) {
        const returnPrompt = 'Return a non-leader unit with 4 or less power to its owner\'s hand';
        const buffPrompt = 'Give a unit +4/+0 for this phase';
        const exhaustPrompt = 'Exhaust up to 2 units';
        const discardPrompt = 'An opponent discards a random card from their hand';

        describe('Cunning\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cunning'],
                        leader: { card: 'the-mandalorian#sworn-to-the-creed', deployed: true },
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: [{ card: 'restored-arc170', exhausted: true, upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'atst', upgrades: ['experience'] }],
                        spaceArena: [{ card: 'green-squadron-awing', upgrades: ['entrenched'] }],
                        hand: ['pyke-sentinel', 'moisture-farmer']
                    }
                });
            });

            it('discards a random card and give +4/+0 to a unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.cunning);

                expect(context.player1).toHaveEnabledPromptButtons([returnPrompt, buffPrompt, exhaustPrompt, discardPrompt]);

                // discard
                expect(context.player2.hand.length).toBe(2);
                expect(context.player2.discard.length).toBe(0);

                context.player1.clickPrompt(discardPrompt);
                expect(context.player2.hand.length).toBe(1);
                expect(context.player2.discard.length).toBe(1);

                expect(context.player1).toHaveEnabledPromptButtons([returnPrompt, buffPrompt, exhaustPrompt]);

                context.player1.clickPrompt(buffPrompt);

                // buff a unit
                expect(context.player1).toBeAbleToSelectExactly([context.theMandalorian, context.wampa, context.battlefieldMarine, context.restoredArc170, context.atst, context.greenSquadronAwing]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(8);
                expect(context.player2).toBeActivePlayer();
            });

            it('exhaust up to 2 units and return a unit with 4 or less power to its owner\'s hand', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.cunning);

                expect(context.player1).toHaveEnabledPromptButtons([returnPrompt, buffPrompt, exhaustPrompt, discardPrompt]);

                // return
                context.player1.clickPrompt(returnPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.restoredArc170, context.greenSquadronAwing]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('hand', context.player1);

                expect(context.player1).toHaveEnabledPromptButtons([buffPrompt, exhaustPrompt, discardPrompt]);

                // exhaust
                context.player1.clickPrompt(exhaustPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.theMandalorian, context.wampa, context.restoredArc170, context.atst, context.greenSquadronAwing]);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickPrompt('Done');

                expect(context.atst.exhausted).toBe(true);
                expect(context.greenSquadronAwing.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
