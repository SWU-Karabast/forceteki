describe('Greedo, Slow on the Draw', function () {
    integration(function (contextRef) {
        describe('Greedo\'s ability', function () {
            const prompt = 'Discard a card from your deck. If it\'s not a unit, deal 2 damage to a ground unit.';

            it('should deal 2 damage to a ground unit if the discarded card is not a unit', function () {
                const { context } = contextRef;
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['greedo#slow-on-the-draw', 'atst'],
                        deck: ['protector']
                    }
                });

                // kill greedo
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.greedo);
                expect(context.greedo).toBeInZone('discard');

                // player2 should have prompt or pass
                expect(context.player2).toHavePassAbilityPrompt(prompt);
                context.player2.clickPrompt(prompt);

                // top card is an upgrade, deal 2 damage to a ground unit
                expect(context.protector).toBeInZone('discard');
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.atst]);

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(2);
            });

            it('should not deal 2 damage to a ground unit if the discarded card is a unit', function () {
                const { context } = contextRef;
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['greedo#slow-on-the-draw', 'atst'],
                        deck: ['isb-agent']
                    }
                });

                // kill greedo
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.greedo);
                expect(context.greedo).toBeInZone('discard');

                // player2 should have prompt or pass
                expect(context.player2).toHavePassAbilityPrompt(prompt);
                context.player2.clickPrompt(prompt);

                // top card is a unit, nothing happen
                expect(context.isbAgent).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not prompt if the deck is empty', function () {
                const { context } = contextRef;
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['greedo#slow-on-the-draw', 'atst'],
                        deck: []
                    }
                });

                // kill greedo
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.greedo);
                expect(context.greedo).toBeInZone('discard');

                // deck is empty, nothing to discard, no prompt
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
