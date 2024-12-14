describe('Bright Hope, The Last Transport', function() {
    integration(function(contextRef) {
        describe('Bright Hope, The Last Transport\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['bright-hope#the-last-transport'],
                        groundArena: ['battlefield-marine', 'specforce-soldier'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should return a friendly ground unit to hand and draw', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.brightHope);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.specforceSoldier]);
                expect(context.player1).toHavePassAbilityButton();

                // return battlefield marine to hand and draw
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1.hand.length).toBe(2);
                expect(context.battlefieldMarine.zoneName).toBe('hand');
                expect(context.specforceSoldier.zoneName).toBe('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not draw if we do not return a ground unit into our hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.brightHope);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.specforceSoldier]);
                expect(context.player1).toHavePassAbilityButton();

                // pass and do not draw
                context.player1.clickPrompt('Pass ability');

                expect(context.player1.hand.length).toBe(0);
                expect(context.battlefieldMarine.zoneName).toBe('groundArena');
                expect(context.specforceSoldier.zoneName).toBe('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Bright Hope, The Last Transport\'s ability should return a friendly token ground unit to hand and draw', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['bright-hope#the-last-transport', 'drop-in'],
                    deck: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dropIn);
            const cloneTroopers = context.player1.findCardsByName('clone-trooper');

            context.player2.passAction();
            context.player1.clickCard(context.brightHope);
            expect(context.player1).toBeAbleToSelectExactly(cloneTroopers);

            context.player1.clickCard(cloneTroopers[0]);
            expect(cloneTroopers[0]).toBeInZone('outsideTheGame');
            expect(context.player1.handSize).toBe(1);
            expect(context.atst).toBeInZone('hand');
        });
    });
});
