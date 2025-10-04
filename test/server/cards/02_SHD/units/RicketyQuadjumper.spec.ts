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
                expect(context.player1).toHavePassAbilityPrompt('Reveal a card. If it\'s not a unit, give an Experience token to another unit');
                context.player1.clickPrompt('Trigger');

                // top card is an upgrade, give exp to another unit
                expect(context.protector).toBeInZone('deck');
                context.player1.clickDone();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.atst]);

                // select battlefield marine
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
                expect(context.getChatLogs(2)).toEqual([
                    'player1 uses Rickety Quadjumper to reveal Protector',
                    'player1 uses Rickety Quadjumper to give an Experience token to Battlefield Marine',
                ]);
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
                expect(context.player1).toHavePassAbilityPrompt('Reveal a card. If it\'s not a unit, give an Experience token to another unit');
                context.player1.clickPrompt('Trigger');

                // top card is a unit, nothing happen
                expect(context.isbAgent).toBeInZone('deck');
                context.player1.clickDone();
                expect(context.player2).toBeActivePlayer();

                expect(context.getChatLogs(1)).toEqual([
                    'player1 uses Rickety Quadjumper to reveal ISB Agent',
                ]);
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
