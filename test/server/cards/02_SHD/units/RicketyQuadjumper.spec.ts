describe('RicketyQuadjumper', function () {
    integration(function (contextRef) {
        describe('Rickety Quadjumper\'s ability', function () {
            it('should give an experience token to another unit if the revealed card is not a unit', async function () {
                const { context } = contextRef;
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['rickety-quadjumper'],
                        deck: ['protector'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                // attack with rickety
                context.player1.clickCard(context.ricketyQuadjumper);
                context.player1.clickCard(context.p2Base);

                // player1 should have prompt or pass
                expect(context.player1).toHavePassAbilityPrompt('Reveal a card');
                context.player1.clickPrompt('Reveal a card');

                // top card is an upgrade, give exp to another unit
                expect(context.protector).toBeInZone('deck');
                expect(context.getChatLogs(1)).toContain('player1 reveals Protector due to Rickety Quadjumper');
                context.player1.clickPrompt('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.atst]);

                // select battlefield marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });


            it('should not give an experience token to another unit if the discarded card is a unit', async function () {
                const { context } = contextRef;
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['rickety-quadjumper'],
                        deck: ['isb-agent'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                // attack with rickety
                context.player1.clickCard(context.ricketyQuadjumper);
                context.player1.clickCard(context.p2Base);
                // player1 should have prompt or pass
                expect(context.player1).toHavePassAbilityPrompt('Reveal a card');
                context.player1.clickPrompt('Reveal a card');

                // top card is a unit, nothing happen
                expect(context.isbAgent).toBeInZone('deck');
                expect(context.getChatLogs(1)).toContain('player1 reveals ISB Agent due to Rickety Quadjumper');
                context.player1.clickPrompt('Done');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not prompt if the deck is empty', async function () {
                const { context } = contextRef;
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['rickety-quadjumper'],
                        deck: [],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                // attack with rickety
                context.player1.clickCard(context.ricketyQuadjumper);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
