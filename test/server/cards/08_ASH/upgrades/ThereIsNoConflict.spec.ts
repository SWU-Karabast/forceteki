describe('There Is No Conflict', function () {
    integration(function (contextRef) {
        it('should return any number of other upgrades on attached unit to owner hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['there-is-no-conflict', 'wampa', 'crafty-smuggler', 'lothal-insurgent'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['condemn'] }],
                },
                player2: {
                    groundArena: [{ card: 'saw-gerrera#extremist', upgrades: ['entrenched', 'shield'] }],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.thereIsNoConflict);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.sawGerrera]);

            context.player1.clickCard(context.sawGerrera);
            expect(context.player1).toBeAbleToSelectExactly([context.entrenched, context.shield]);
            expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
            expect(context.player1).toHavePrompt('Return any number of other upgrades on Saw Gerrera to their owners hands');
            context.player1.clickCard(context.entrenched);
            context.player1.clickPrompt('Done');

            expect(context.player2).toBeActivePlayer();
            expect(context.player2.hand.length).toBe(1);
            expect(context.entrenched).toBeInZone('hand', context.player2);
            expect(context.sawGerrera).toHaveExactUpgradeNames(['shield', 'there-is-no-conflict']);
        });

        it('There Is No Conflict should be defeat a leader upgrade attached to a vehicle it attaches to', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'boba-fett#any-methods-necessary',
                    spaceArena: ['cartel-spacer'],
                    resources: 6
                },
                player2: {
                    hand: ['there-is-no-conflict']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bobaFett);
            context.player1.clickPrompt('Deploy Boba Fett as a Pilot');
            context.player1.clickCard(context.cartelSpacer);
            context.player1.setDistributeDamagePromptState(new Map([]));

            context.player2.clickCard(context.thereIsNoConflict);
            expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer]);
            context.player2.clickCard(context.cartelSpacer);
            expect(context.player2).toBeAbleToSelectExactly([context.bobaFett]);
            context.player2.clickCard(context.bobaFett);
            context.player2.clickPrompt('Done');

            // Check that Boba has been defeated
            expect(context.bobaFett).toBeInZone('base');
            expect(context.bobaFett.exhausted).toBeTrue();
            expect(context.bobaFett.deployed).toBeFalse();

            // Ensure Boba cannot re-deploy
            context.moveToNextActionPhase();
            expect(context.bobaFett).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});
