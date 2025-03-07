describe('Admiral Holdo, We\'re Not Alone', function () {
    integration(function (contextRef) {
        it('Admiral Holdo\'s undeployed ability should give +2/+2 for the phase to a resistance unit or a unit with a resistance upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'admiral-holdo#were-not-alone',
                    hand: ['determined-recruit'],
                    groundArena: ['rey#keeping-the-past', 'battlefield-marine'],
                    spaceArena: ['dqar-cargo-frigate', 'green-squadron-awing'],
                    resources: 3
                },
                player2: {
                    groundArena: ['poe-dameron#quick-to-improvise']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.determinedRecruit);
            context.player1.clickPrompt('Play Determined Recruit with Piloting');
            context.player1.clickCard(context.greenSquadronAwing);

            context.player2.passAction();

            context.player1.clickCard(context.admiralHoldo);
            expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.rey, context.dqarCargoFrigate, context.greenSquadronAwing]);
            context.player1.clickCard(context.rey);

            expect(context.rey.getPower()).toBe(6);
            expect(context.rey.getHp()).toBe(9);

            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.admiralHoldo.exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();

            context.moveToNextActionPhase();

            expect(context.rey.getPower()).toBe(4);
            expect(context.rey.getHp()).toBe(7);
        });

        it('Admiral Holdo\'s deployed ability may give +2/+2 for the phase to a resistance unit or a unit with a resistance upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'admiral-holdo#were-not-alone', deployed: true },
                    hand: ['determined-recruit'],
                    groundArena: ['rey#keeping-the-past', 'battlefield-marine'],
                    spaceArena: ['dqar-cargo-frigate', 'green-squadron-awing'],
                },
                player2: {
                    groundArena: ['poe-dameron#quick-to-improvise']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.determinedRecruit);
            context.player1.clickPrompt('Play Determined Recruit with Piloting');
            context.player1.clickCard(context.greenSquadronAwing);

            context.player2.passAction();

            context.player1.clickCard(context.admiralHoldo);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.rey, context.dqarCargoFrigate, context.greenSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.rey);

            expect(context.rey.getPower()).toBe(6);
            expect(context.rey.getHp()).toBe(9);

            expect(context.player2).toBeActivePlayer();

            context.moveToNextActionPhase();

            expect(context.rey.getPower()).toBe(4);
            expect(context.rey.getHp()).toBe(7);
        });
    });
});
