describe('Ryder Azadi, Restored Governor', function () {
    integration(function (contextRef) {
        describe('Ryder Azadi\'s ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ryder-azadi#restored-governor', 'millennium-falcon#landos-pride'],
                    },
                    player2: {
                        hand: ['millennium-falcon#piece-of-junk', 'millennium-falcon#landos-pride', 'green-squadron-awing', 'vanquish', 'change-of-heart', 'palpatines-return', 'triple-dark-raid'],
                        resources: ['millennium-falcon#landos-pride', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                        discard: ['millennium-falcon#get-out-and-push', 'consular-security-force'],
                        deck: ['millennium-falcon#piece-of-junk', 'seventh-fleet-defender'],
                    }
                });
            });

            it('should name a card when played', function () {
                const { context } = contextRef;

                // play ryder azadi and name millennium falcon
                context.player1.clickCard(context.ryderAzadi);
                expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
                context.player1.chooseListOption('Millennium Falcon');
                expect(context.getChatLogs(2)).toContain('player1 names Millennium Falcon using Ryder Azadi');

                expect(context.player2).toBeActivePlayer();
            });

            it('should prevent the opponent from playing the named card from their hand', function () {
                const { context } = contextRef;

                const player2Falcon1Hand = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'hand');
                const player2Falcon2Hand = context.player2.findCardByName('millennium-falcon#landos-pride', 'hand');

                context.player1.clickCard(context.ryderAzadi);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 cannot play any falcon from hand
                expect(context.player2).toBeAbleToSelectNoneOf([player2Falcon1Hand, player2Falcon2Hand]);
                expect(player2Falcon1Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
                expect(player2Falcon2Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('should prevent the opponent from playing the named card using Smuggle', function () {
                const { context } = contextRef;

                const player2FalconResources = context.player2.findCardByName('millennium-falcon#landos-pride', 'resource');

                context.player1.clickCard(context.ryderAzadi);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 cannot play falcon from resources using smuggle
                expect(player2FalconResources).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('should not prevent the opponent from playing other cards', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ryderAzadi);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 can still play a card with a different name
                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing).toBeInZone('spaceArena');
            });

            it('should not prevent the controller from playing the named card', function () {
                const { context } = contextRef;

                const player1FalconHand = context.player1.findCardByName('millennium-falcon#landos-pride', 'hand');

                context.player1.clickCard(context.ryderAzadi);
                context.player1.chooseListOption('Millennium Falcon');

                context.player2.passAction();

                // player 1 can still play falcon (no enemy space units so no Ambush prompt)
                context.player1.clickCard(player1FalconHand);
                expect(player1FalconHand).toBeInZone('spaceArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should prevent the named card from being played from the deck', function () {
                const { context } = contextRef;

                const player2FalconDeck = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'deck');

                context.player1.clickCard(context.ryderAzadi);
                context.player1.chooseListOption('Millennium Falcon');

                // play triple dark raid, cannot play falcon from the deck
                context.player2.clickCard(context.tripleDarkRaid);
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [context.seventhFleetDefender],
                    invalid: [player2FalconDeck]
                });
                context.player2.clickCardInDisplayCardPrompt(context.seventhFleetDefender);
                expect(context.seventhFleetDefender).toBeInZone('spaceArena');
            });

            it('should prevent the named card from being played from the discard pile', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ryderAzadi);
                context.player1.chooseListOption('Millennium Falcon');

                // play palpatine's return, cannot play falcon from the discard pile
                context.player2.clickCard(context.palpatinesReturn);
                expect(context.player2).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player2.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce).toBeInZone('groundArena');
            });

            it('should still prevent the opponent from playing the named card on the next action phase', function () {
                const { context } = contextRef;

                const player2Falcon1Hand = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'hand');
                const player2Falcon2Hand = context.player2.findCardByName('millennium-falcon#landos-pride', 'hand');
                const player2FalconResources = context.player2.findCardByName('millennium-falcon#landos-pride', 'resource');

                context.player1.clickCard(context.ryderAzadi);
                context.player1.chooseListOption('Millennium Falcon');

                // the effect lasts while the unit is in play, even on future action phases
                context.moveToNextActionPhase();
                context.player1.passAction();

                expect(context.player2).toBeAbleToSelectNoneOf([player2Falcon1Hand, player2Falcon2Hand, player2FalconResources]);
                expect(player2Falcon1Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
                expect(player2Falcon2Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
                expect(player2FalconResources).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('should still prevent that opponent from playing the named card if they take control of it', function () {
                const { context } = contextRef;

                const player1FalconHand = context.player1.findCardByName('millennium-falcon#landos-pride', 'hand');
                const player2Falcon1Hand = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'hand');
                const player2Falcon2Hand = context.player2.findCardByName('millennium-falcon#landos-pride', 'hand');

                context.player1.clickCard(context.ryderAzadi);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 takes control of ryder azadi
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.ryderAzadi);

                // player 1 can still play falcon
                context.player1.clickCard(player1FalconHand);
                expect(player1FalconHand).toBeInZone('spaceArena');

                // but player 2 cannot
                expect(player2Falcon1Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
                expect(player2Falcon2Hand).not.toHaveAvailableActionWhenClickedBy(context.player2);
            });

            it('should no longer prevent the named card once it leaves play', function () {
                const { context } = contextRef;

                const player2Falcon1Hand = context.player2.findCardByName('millennium-falcon#piece-of-junk', 'hand');

                context.player1.clickCard(context.ryderAzadi);
                context.player1.chooseListOption('Millennium Falcon');

                // player 2 defeats ryder azadi
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.ryderAzadi);

                context.player1.passAction();

                // player 2 can play falcon again
                context.player2.clickCard(player2Falcon1Hand);
                expect(player2Falcon1Hand).toBeInZone('spaceArena');
            });
        });

        it('Ryder Azadi\'s ability should not prevent a captured copy of the named card from being rescued', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ryder-azadi#restored-governor'],
                    spaceArena: [{ card: 'millennium-falcon#landos-pride', capturedUnits: ['millennium-falcon#piece-of-junk'] }]
                },
                player2: {
                    hand: ['vanquish'],
                    resources: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                }
            });

            const { context } = contextRef;

            const player2Falcon = context.player2.findCardByName('millennium-falcon#piece-of-junk');
            expect(player2Falcon).toBeCapturedBy(context.millenniumFalconLandosPride);

            // play ryder azadi and name millennium falcon
            context.player1.clickCard(context.ryderAzadi);
            context.player1.chooseListOption('Millennium Falcon');

            // defeat the captor, the captured falcon is rescued rather than played
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.millenniumFalconLandosPride);
            expect(player2Falcon).toBeInZone('spaceArena');
        });

        it('Ryder Azadi\'s ability should disallow playing a unit as a pilot', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ryder-azadi#restored-governor'],
                },
                player2: {
                    hand: ['dagger-squadron-pilot'],
                    spaceArena: ['cartel-turncoat']
                }
            });

            const { context } = contextRef;

            // play ryder azadi and say dagger squadron pilot
            context.player1.clickCard(context.ryderAzadi);
            expect(context.player1).toHaveExactDropdownListOptions(context.getPlayableCardTitles());
            context.player1.chooseListOption('Dagger Squadron Pilot');
            context.player2.passAction();

            expect(context.daggerSquadronPilot).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('should allow Topple the Summit to be played via Plot once Ryder Azadi is defeated by the same deploy\'s damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ryder-azadi#restored-governor'],
                },
                player2: {
                    leader: 'boba-fett#any-methods-necessary',
                    hand: ['daring-raid'],
                    groundArena: ['war-juggernaut'],
                    resources: ['topple-the-summit', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                }
            });

            const { context } = contextRef;

            // player1 plays Ryder Azadi and names Topple the Summit, so player2 can't play it while Azadi is in play
            context.player1.clickCard(context.ryderAzadi);
            context.player1.chooseListOption('Topple the Summit');
            expect(context.player2).toBeActivePlayer();

            // player2 chips 2 damage into Azadi with Daring Raid
            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.ryderAzadi);
            expect(context.ryderAzadi.damage).toBe(2);

            // decline Boba's undeployed "exhaust to deal 1 indirect damage" trigger off the non-combat damage
            expect(context.player2).toHavePassAbilityPrompt('Exhaust this leader to deal 1 indirect damage to a player');
            context.player2.clickPrompt('Pass');

            context.player1.passAction();

            // player2 deploys Boba Fett as a Pilot on War Juggernaut, which triggers both
            // Boba's own damage ability and Topple the Summit's Plot ability off the same leader-deploy event
            context.player2.clickCard(context.bobaFett);
            context.player2.clickPrompt('Deploy Boba Fett as a Pilot');
            context.player2.clickCard(context.warJuggernaut);

            // two triggers are now pending for player2: Boba's damage ability and Topple's Plot ability.
            // Azadi is still alive here, so the Plot trigger is offered but marked as having no effect
            expect(context.player2).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
            expect(context.player2).toHaveExactPromptButtons([
                'Deal up to 4 damage divided as you choose among any number of units.',
                '(No effect) Play Topple the Summit using Plot',
            ]);

            // resolve Boba's damage ability first, defeating Azadi (2 + 4 >= 5 hp)
            context.player2.clickPrompt('Deal up to 4 damage divided as you choose among any number of units.');
            context.player2.setDistributeDamagePromptState(new Map([
                [context.ryderAzadi, 4],
            ]));
            expect(context.ryderAzadi).toBeInZone('discard');

            // Azadi is gone, so its "opponents can't play" restriction should no longer apply -
            // Topple the Summit's Plot trigger should now be offered and playable
            expect(context.player2).toHavePassAbilityPrompt('Play Topple the Summit using Plot');
            context.player2.clickPrompt('Trigger');

            expect(context.toppleTheSummit).toBeInZone('discard');
        });

        it('should allow Cinta Kaz (a Plot unit) to be played via Plot once Ryder Azadi is defeated by the same deploy\'s damage', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ryder-azadi#restored-governor'],
                },
                player2: {
                    leader: 'boba-fett#any-methods-necessary',
                    hand: ['daring-raid'],
                    groundArena: ['war-juggernaut'],
                    resources: ['cinta-kaz#the-struggle-comes-first', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'],
                }
            });

            const { context } = contextRef;

            // player1 plays Ryder Azadi and names Cinta Kaz, so player2 can't play it while Azadi is in play
            context.player1.clickCard(context.ryderAzadi);
            context.player1.chooseListOption('Cinta Kaz');
            expect(context.player2).toBeActivePlayer();

            // player2 chips 2 damage into Azadi with Daring Raid
            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.ryderAzadi);
            expect(context.ryderAzadi.damage).toBe(2);

            // decline Boba's undeployed "exhaust to deal 1 indirect damage" trigger off the non-combat damage
            expect(context.player2).toHavePassAbilityPrompt('Exhaust this leader to deal 1 indirect damage to a player');
            context.player2.clickPrompt('Pass');

            context.player1.passAction();

            // player2 deploys Boba Fett as a Pilot on War Juggernaut, which triggers both
            // Boba's own damage ability and Cinta Kaz's Plot ability off the same leader-deploy event
            context.player2.clickCard(context.bobaFett);
            context.player2.clickPrompt('Deploy Boba Fett as a Pilot');
            context.player2.clickCard(context.warJuggernaut);

            // two triggers are now pending for player2: Boba's damage ability and Cinta Kaz's Plot ability.
            // Azadi is still alive here, so the Plot trigger is offered but marked as having no effect
            expect(context.player2).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
            expect(context.player2).toHaveExactPromptButtons([
                'Deal up to 4 damage divided as you choose among any number of units.',
                '(No effect) Play Cinta Kaz using Plot',
            ]);

            // resolve Boba's damage ability first, defeating Azadi (2 + 4 >= 5 hp)
            context.player2.clickPrompt('Deal up to 4 damage divided as you choose among any number of units.');
            context.player2.setDistributeDamagePromptState(new Map([
                [context.ryderAzadi, 4],
            ]));
            expect(context.ryderAzadi).toBeInZone('discard');

            // Azadi is gone, so its "opponents can't play" restriction should no longer apply -
            // Cinta Kaz's Plot trigger should now be offered and playable, same as an event Plot card
            expect(context.player2).toHavePassAbilityPrompt('Play Cinta Kaz using Plot');
            context.player2.clickPrompt('Trigger');

            // Cinta Kaz's own "When Played" ability offers an attack; decline it
            context.player2.clickPrompt('Pass');

            expect(context.cintaKaz).toBeInZone('groundArena');
        });
    });
});
