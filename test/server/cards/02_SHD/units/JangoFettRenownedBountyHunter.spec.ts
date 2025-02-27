describe('Jango Fett, Renowned Bounty Hunter', function() {
    integration(function(contextRef) {
        describe('Jango Fett\'s Bounty ability', function() {
            it('should get +3/+0 and overwhelm while attacking enemy unit and draw when killing enemy units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['jango-fett#renowned-bounty-hunter']
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer', 'battlefield-marine', 'wampa', { card: 'maz-kanata#pirate-queen', upgrades: ['wanted'] }, 'seasoned-shoretrooper']
                    }
                });

                const { context } = contextRef;

                function reset() {
                    context.setDamage(context.jangoFett, 0);
                    context.setDamage(context.p2Base, 0);
                    context.jangoFett.exhausted = false;
                    context.player2.passAction();
                }

                // kill a unit with printed bounty : +3/+0, overwhelm and draw
                context.player1.clickCard(context.jangoFett);
                context.player1.clickCard(context.hylobonEnforcer);
                context.player1.clickPrompt('Draw a card');

                // pass draw from hylobon
                context.player1.clickPrompt('Pass');

                expect(context.hylobonEnforcer.zoneName).toBe('discard');
                expect(context.p2Base.damage).toBe(2);
                expect(context.player1.hand.length).toBe(1); // first draw
                reset();

                // kill a unit without bounty : draw
                context.player1.clickCard(context.jangoFett);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.zoneName).toBe('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1.hand.length).toBe(2); // second draw
                reset();

                // kill a unit with an added bounty : +3/+0, overwhelm and draw
                context.player1.clickCard(context.jangoFett);
                context.player1.clickCard(context.mazKanata);
                context.player1.clickPrompt('Draw a card');

                expect(context.mazKanata.zoneName).toBe('discard');
                expect(context.p2Base.damage).toBe(5);
                expect(context.player1.hand.length).toBe(3); // third draw
                reset();

                // not killing a unit: no draw
                context.player1.clickCard(context.jangoFett);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.zoneName).toBe('groundArena');
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1.hand.length).toBe(3); // no draw, still 3

                // kill a unit but while defending: no draw
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.jangoFett);

                expect(context.jangoFett.zoneName).toBe('discard');
                expect(context.wampa.zoneName).toBe('discard');
                expect(context.player1.hand.length).toBe(3);// no draw, still 3

                // revive jango to the last test
                context.player1.moveCard(context.jangoFett, 'groundArena');
                context.setDamage(context.jangoFett, 3);
                context.moveToNextActionPhase();

                // jango kill shoretrooper and die, we should draw
                const handSize = context.player1.hand.length;
                context.player1.clickCard(context.jangoFett);
                context.player1.clickCard(context.seasonedShoretrooper);

                expect(context.jangoFett.zoneName).toBe('discard');
                expect(context.battlefieldMarine.zoneName).toBe('discard');

                expect(context.p2Base.damage).toBe(0);
                expect(context.player1.hand.length).toBe(handSize + 1);
            });
        });
    });
});
