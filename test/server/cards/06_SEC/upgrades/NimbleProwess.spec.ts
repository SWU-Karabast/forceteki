describe('Nimble Prowess', function () {
    integration(function (contextRef) {
        describe('Nimble Prowess\'s ability', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['nimble-prowess'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['green-squadron-awing', 'phoenix-squadron-awing']
                    }
                });
            });

            it('should exhaust a unit in the attached unit\'s arena (ground)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nimbleProwess);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeTrue();
            });

            it('Nimble Prowess\'s ability should exhaust a unit in the attached unit\'s arena (space)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.nimbleProwess);
                context.player1.clickCard(context.awing);

                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.greenSquadronAwing, context.phoenixSquadronAwing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player2).toBeActivePlayer();
                expect(context.greenSquadronAwing.exhausted).toBeTrue();
            });
        });

        it('Nimble Prowess\'s ability can be played from opponent discard (with A Fine Addition) and exhaust a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['a-fine-addition', 'takedown'],
                    groundArena: ['wampa']
                },
                player2: {
                    discard: ['nimble-prowess'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.awing);

            context.player2.passAction();
            context.player1.clickCard(context.aFineAddition);
            context.player1.clickCard(context.nimbleProwess);
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine.exhausted).toBeTrue();
        });
    });
});