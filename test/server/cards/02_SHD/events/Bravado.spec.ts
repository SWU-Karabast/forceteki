describe('Bravado', function () {
    integration(function (contextRef) {
        describe('Bravado\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['bravado', 'rivals-fall'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        base: 'kestro-city'
                    },
                    player2: {
                        groundArena: ['atst', 'general-tagge#concerned-commander'],
                    }
                });
            });

            it('should ready a unit (no defeated unit, cost = 5)', function () {
                const { context } = contextRef;
                context.wampa.exhausted = true;

                // play bravado
                context.player1.clickCard(context.bravado);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.atst, context.generalTagge]);

                // ready wampa
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player1.countExhaustedResources()).toBe(5);
            });

            it('should ready a unit (we defeat a unit (with attack), cost = 3)', function () {
                const { context } = contextRef;

                // wampa kill tagge
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.generalTagge);
                context.player2.passAction();

                // play bravado
                context.player1.clickCard(context.bravado);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.atst]);

                // ready wampa
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player1.countExhaustedResources()).toBe(3);
            });

            it('should ready a unit (we defeat a unit (with event), cost = 3)', function () {
                const { context } = contextRef;
                context.wampa.exhausted = true;

                // kill tagge with an event
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.generalTagge);
                context.player2.passAction();
                const exhaustedResources = context.player1.countExhaustedResources();

                // play bravado
                context.player1.clickCard(context.bravado);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.atst]);

                // ready wampa
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player1.countExhaustedResources()).toBe(exhaustedResources + 3);
            });

            it('should ready a unit (our unit was defeat, cost = 5)', function () {
                const { context } = contextRef;

                context.wampa.exhausted = true;
                context.player1.passAction();

                // atst kill our battlefield marine
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.battlefieldMarine);

                // play bravado
                context.player1.clickCard(context.bravado);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.generalTagge]);

                // ready wampa
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player1.countExhaustedResources()).toBe(5);
            });

            it('should ready a unit (an enemy unit was defeated by opponent, cost = 5)', function () {
                const { context } = contextRef;

                context.wampa.exhausted = true;
                context.player1.passAction();

                // tagge kill himself by attacking our battlefield marine
                context.player2.clickCard(context.generalTagge);
                context.player2.clickCard(context.battlefieldMarine);

                // play bravado
                context.player1.clickCard(context.bravado);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.battlefieldMarine]);

                // ready wampa
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.player1.countExhaustedResources()).toBe(5);
            });
        });
    });
});
