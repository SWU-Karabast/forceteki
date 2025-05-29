describe('Bossk, Deadly Stalker', function () {
    integration(function (contextRef) {
        describe('Bossk\'s ability', function () {
            it('should deal 2 damage to a unit when controller plays events', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['smugglers-aid', 'tactical-advantage'],
                        groundArena: ['bossk#deadly-stalker'],
                    },
                    player2: {
                        hand: ['moment-of-peace'],
                        spaceArena: ['green-squadron-awing'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.smugglersAid);
                // bossk triggers
                expect(context.player1).toBeAbleToSelectExactly([context.bossk, context.greenSquadronAwing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player2).toBeActivePlayer();
                expect(context.greenSquadronAwing.damage).toBe(2);

                // enemy plays event : nothing happens
                context.player2.clickCard(context.momentOfPeace);
                context.player2.clickCard(context.greenSquadronAwing);

                // play another event, bossk should trigger
                context.player1.clickCard(context.tacticalAdvantage);
                context.player1.clickCard(context.bossk);
                expect(context.player1).toBeAbleToSelectExactly([context.bossk, context.greenSquadronAwing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.greenSquadronAwing);

                // shield was destroyed
                expect(context.player2).toBeActivePlayer();
                expect(context.greenSquadronAwing.damage).toBe(2);
                expect(context.greenSquadronAwing.isUpgraded()).toBeFalse();
            });

            it('should not trigger off of the event card that played him', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['now-there-are-two-of-them', 'bossk#deadly-stalker'],
                        groundArena: ['boba-fett#disintegrator'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.nowThereAreTwoOfThem);
                context.player1.clickCard(context.bossk);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
