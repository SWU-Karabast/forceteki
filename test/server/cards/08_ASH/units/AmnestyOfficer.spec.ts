describe('Amnesty Officer', function() {
    integration(function(contextRef) {
        it('Amnesty Officer\'s ability should exhaust a unit with one or more Keyword', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['amnesty-officer'],
                    groundArena: ['scorpenek-annihilator-droid'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['atst', 'battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.amnestyOfficer);
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.atst, context.scorpenekAnnihilatorDroid]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.exhausted).toBeTrue();
        });

        it('Amnesty Officer\'s ability should exhaust a unit which has gained a Keyword this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['amnesty-officer'],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['wedge-antilles#star-of-the-rebellion'],
                    spaceArena: ['phoenix-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.amnestyOfficer);
            expect(context.player1).toBeAbleToSelectExactly([context.awing, context.phoenixSquadronAwing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.phoenixSquadronAwing);

            expect(context.player2).toBeActivePlayer();
            expect(context.phoenixSquadronAwing.exhausted).toBeTrue();
        });

        it('Amnesty Officer\'s ability should not exhaust a unit which has lost his Keyword this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['amnesty-officer', 'specforce-soldier'],
                    spaceArena: ['awing']
                },
                player2: {
                    spaceArena: ['corellian-freighter']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.specforceSoldier);
            context.player1.clickCard(context.corellianFreighter);

            context.player2.passAction();

            context.player1.clickCard(context.amnestyOfficer);
            expect(context.player1).toBeAbleToSelectExactly([context.awing]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.awing.exhausted).toBeFalse();
            expect(context.corellianFreighter.exhausted).toBeFalse();
        });
    });
});