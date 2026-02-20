describe('L337 Radical Instigator', function () {
    integration(function (contextRef) {
        describe('L337 Radical Instigator\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['l337#radical-instigator'],
                        spaceArena: ['awing'],
                        deck: [
                            'r2d2#artooooooooo', 'baktoid-spider-droid',
                            'super-battle-droid', 'battlefield-marine',
                            'vanguard-infantry', 'daring-raid',
                            'protector', 'devastating-gunship',
                            'bt1#blastomech', 'atst', 'yoda#old-master'
                        ],
                        base: 'echo-base',
                        leader: 'boba-fett#any-methods-necessary'
                    }
                });
            });

            it('should search the top 10 cards and play Droid units with total cost <= 5 for free', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.l337RadicalInstigator);

                expect(context.player1).toHavePrompt('Choose any Droid units with combined cost 5 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.r2d2, context.devastatingGunship, context.superBattleDroid, context.bt1],
                    invalid: [context.battlefieldMarine, context.vanguardInfantry, context.daringRaid, context.protector, context.atst, context.baktoidSpiderDroid]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.bt1);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    usesSelectionOrder: true,
                    selectable: [context.r2d2, context.superBattleDroid],
                    selected: [context.bt1],
                    unselectable: [context.devastatingGunship],
                    invalid: [context.battlefieldMarine, context.vanguardInfantry, context.daringRaid, context.protector, context.atst, context.baktoidSpiderDroid]
                });
                context.player1.clickCardInDisplayCardPrompt(context.superBattleDroid);
                context.player1.clickPrompt('Play cards in selection order');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.bt1).toBeInZone('groundArena', context.player1);
                expect(context.superBattleDroid).toBeInZone('groundArena', context.player1);
                expect([context.r2d2, context.devastatingGunship, context.battlefieldMarine, context.vanguardInfantry, context.daringRaid, context.protector, context.atst, context.baktoidSpiderDroid]).toAllBeInBottomOfDeck(context.player1, 8);
            });

            it('should search the top 10 cards and play Droid units with total cost <= 5 for free (ignore aspect penalties)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.l337RadicalInstigator);

                expect(context.player1).toHavePrompt('Choose any Droid units with combined cost 5 or less to play for free');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.r2d2, context.devastatingGunship, context.superBattleDroid, context.bt1],
                    invalid: [context.battlefieldMarine, context.vanguardInfantry, context.daringRaid, context.protector, context.atst, context.baktoidSpiderDroid]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.devastatingGunship);
                context.player1.clickPrompt('Play cards in selection order');


                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.devastatingGunship).toBeInZone('spaceArena', context.player1);
                expect([context.r2d2, context.superBattleDroid, context.bt1, context.battlefieldMarine, context.vanguardInfantry, context.daringRaid, context.protector, context.atst, context.baktoidSpiderDroid]).toAllBeInBottomOfDeck(context.player1, 9);
            });

            it('should search the top 10 cards and play Droid units with total cost <= 5 for free (cannot play a Piloting unit as Pilot)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.l337RadicalInstigator);

                context.player1.clickCardInDisplayCardPrompt(context.r2d2);
                context.player1.clickPrompt('Play cards in selection order');

                // cannot play R2-D2 as Pilot
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.r2d2).toBeInZone('groundArena', context.player1);
            });

            it('should allow the player to take nothing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.l337RadicalInstigator);

                expect(context.player1).toHavePrompt('Choose any Droid units with combined cost 5 or less to play for free');
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickPrompt('Take nothing');
                expect([context.superBattleDroid, context.bt1, context.r2d2, context.devastatingGunship, context.battlefieldMarine, context.vanguardInfantry, context.daringRaid, context.protector, context.atst, context.baktoidSpiderDroid]).toAllBeInBottomOfDeck(context.player1, 10);
            });
        });
    });
});
