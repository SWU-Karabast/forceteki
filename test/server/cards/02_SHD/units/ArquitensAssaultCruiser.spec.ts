describe('Arquitens Assault Cruiser', function() {
    integration(function(contextRef) {
        describe('Arquitens Assault Cruiser\'s triggered ability', function() {
            it('will resource a unit for the Arquitens controller if Arquitens attacks and defeats it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['arquitens-assault-cruiser'],
                        spaceArena: ['tie-advanced']
                    },
                    player2: {
                        spaceArena: [
                            'tieln-fighter',
                            'gideons-light-cruiser#dark-troopers-station',
                            'cartel-spacer',
                            'imperial-interceptor'
                        ]
                    }
                });

                const { context } = contextRef;

                const reset = (passAction = true) => {
                    context.setDamage(context.arquitensAssaultCruiser, 0);
                    context.readyCard(context.arquitensAssaultCruiser);
                    if (passAction) {
                        context.player2.passAction();
                    }
                };

                // CASE 1: Arquitens ambush kills a unit
                context.player1.clickCard(context.arquitensAssaultCruiser);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.tielnFighter);
                expect(context.tielnFighter).toBeInZone('resource', context.player1);
                expect(context.tielnFighter.exhausted).toBeTrue();
                expect(context.arquitensAssaultCruiser.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                reset();

                // CASE 2: Arquitens attacks and does not defeat, ability does not trigger
                context.player1.clickCard(context.arquitensAssaultCruiser);
                context.player1.clickCard(context.gideonsLightCruiser);
                expect(context.gideonsLightCruiser).toBeInZone('spaceArena');
                expect(context.gideonsLightCruiser.damage).toBe(7);
                expect(context.arquitensAssaultCruiser.damage).toBe(7);

                reset(false);

                // CASE 3: Enemy attacks into Arquitens and dies, ability doesn't trigger
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.arquitensAssaultCruiser);
                expect(context.cartelSpacer).toBeInZone('discard');
                expect(context.arquitensAssaultCruiser.damage).toBe(2);

                reset(false);

                // CASE 4: friendly unit trades with enemy unit, Arquitens ability does not trigger
                expect(context.player1).toBeActivePlayer();
                context.player1.clickCard(context.tieAdvanced);
                context.player1.clickCard(context.imperialInterceptor);
                expect(context.tieAdvanced).toBeInZone('discard');
                expect(context.imperialInterceptor).toBeInZone('discard');
            });

            it('will trigger if the unit is defeated by an on-attack ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'arquitens-assault-cruiser', upgrades: ['twin-laser-turret'] }]
                    },
                    player2: {
                        spaceArena: [{ card: 'cartel-spacer', damage: 2 }, { card: 'imperial-interceptor', damage: 1 }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.arquitensAssaultCruiser);
                context.player1.clickCard(context.cartelSpacer);

                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.imperialInterceptor);
                context.player1.clickPrompt('Done');

                expect(context.imperialInterceptor).toBeInZone('discard', context.player2);
                expect(context.cartelSpacer).toBeInZone('resource', context.player1);
                expect(context.arquitensAssaultCruiser.damage).toBe(0);
            });

            it('will not trigger if the unit is a leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['arquitens-assault-cruiser'],
                    },
                    player2: {
                        leader: 'major-vonreg#red-baron',
                        spaceArena: ['cartel-spacer'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.majorVonreg);
                context.player2.clickPrompt('Deploy Major Vonreg as a Pilot');
                context.player2.clickCard(context.cartelSpacer);

                context.player1.clickCard(context.arquitensAssaultCruiser);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('discard', context.player2);
            });

            it('will not trigger if the unit is a token unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['arquitens-assault-cruiser'],
                    },
                    player2: {
                        spaceArena: ['xwing'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.arquitensAssaultCruiser);
                context.player1.clickCard(context.xwing);

                expect(context.xwing).toBeInZone('outsideTheGame', context.player2);
            });
        });
    });
});
