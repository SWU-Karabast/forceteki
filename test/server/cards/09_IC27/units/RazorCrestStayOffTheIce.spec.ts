describe('Razor Crest, Stay Off the Ice', function() {
    integration(function(contextRef) {
        describe('Razor Crest\'s constant ability', function() {
            it('should stop a friendly unit\'s When Defeated ability from triggering', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['razor-crest#stay-off-the-ice'],
                        groundArena: ['superlaser-technician']
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const resourceCount = context.player1.resources.length;

                // Player 1 passes, then player 2 defeats Superlaser Technician
                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.superlaserTechnician);

                // No "Trigger" prompt; Superlaser Technician is not put into play as a resource
                expect(context.superlaserTechnician).toBeInZone('discard', context.player1);
                expect(context.player1.resources.length).toBe(resourceCount);
                expect(context.player1).toBeActivePlayer();
            });

            it('should stop When Defeated abilities when units are defeated simultaneously with Razor Crest', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['superlaser-blast'],
                        spaceArena: ['razor-crest#stay-off-the-ice', 'senatorial-corvette'],
                        groundArena: ['superlaser-technician'],
                        resources: 12
                    },
                    player2: {
                        hand: ['cartel-spacer'],
                        spaceArena: ['ruthless-raider'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Superlaser Blast, defeating every unit at once
                context.player1.clickCard(context.superlaserBlast);

                expect(context.razorCrest).toBeInZone('discard');
                expect(context.senatorialCorvette).toBeInZone('discard');
                expect(context.superlaserTechnician).toBeInZone('discard');
                expect(context.ruthlessRaider).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');

                // No When Defeated abilities triggered
                expect(context.cartelSpacer).toBeInZone('hand');
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should only block the When Defeated half of a When Played / When Defeated ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ruthless-raider'],
                        spaceArena: ['razor-crest#stay-off-the-ice']
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Ruthless Raider; its When Played still resolves
                context.player1.clickCard(context.ruthlessRaider);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(2);
                expect(context.p2Base.damage).toBe(2);

                // Player 2 defeats Ruthless Raider; its When Defeated does not trigger
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.ruthlessRaider);

                expect(context.ruthlessRaider).toBeInZone('discard', context.player1);
                expect(context.wampa.damage).toBe(2);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player1).toBeActivePlayer();
            });

            it('should stop a When Defeated ability gained from an upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['razor-crest#stay-off-the-ice'],
                        groundArena: [{ card: 'wampa', upgrades: ['clone-cohort'] }]
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;

                // Player 1 passes, then player 2 defeats the upgraded Wampa
                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.wampa);

                // The gained When Defeated does not create a Clone Trooper
                expect(context.wampa).toBeInZone('discard', context.player1);
                expect(context.player1.findCardsByName('clone-trooper').length).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('should stop working once Razor Crest is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['direct-hit'],
                        groundArena: ['superlaser-technician']
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        spaceArena: ['razor-crest#stay-off-the-ice']
                    }
                });

                const { context } = contextRef;

                // Player 1 defeats Razor Crest
                context.player1.clickCard(context.directHit);
                context.player1.clickCard(context.razorCrest);

                expect(context.razorCrest).toBeInZone('discard', context.player2);
                expect(context.player2).toBeActivePlayer();

                // Player 2 defeats Superlaser Technician; When Defeated works again now that Razor Crest is gone
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.superlaserTechnician);

                expect(context.player1).toHavePassAbilityPrompt('Put Superlaser Technician into play as a resource and ready it');
                context.player1.clickPrompt('Trigger');
                expect(context.superlaserTechnician).toBeInZone('resource', context.player1);
            });

            it('should stop When Defeated abilities when No Glory, Only Results takes control of an enemy unit and defeats it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        spaceArena: ['razor-crest#stay-off-the-ice']
                    },
                    player2: {
                        groundArena: ['superlaser-technician']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays No Glory, Only Results
                context.player1.clickCard(context.noGloryOnlyResults);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.razorCrest,
                    context.superlaserTechnician
                ]);
                context.player1.clickCard(context.superlaserTechnician);

                // Superlaser Technician is defeated with no optional "Trigger" prompt
                expect(context.superlaserTechnician).toBeInZone('discard', context.player2);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player2).toBeActivePlayer();
            });

            it('should apply to the other player\'s units when the opponent controls Razor Crest', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['direct-hit'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        hand: ['cartel-spacer'],
                        spaceArena: ['razor-crest#stay-off-the-ice', 'senatorial-corvette']
                    }
                });

                const { context } = contextRef;

                // Player 1 takes and defeats the enemy Senatorial Corvette
                context.player1.clickCard(context.directHit);
                context.player1.clickCard(context.senatorialCorvette);

                // Corvette's "opponent discards a card" does not trigger
                expect(context.senatorialCorvette).toBeInZone('discard', context.player2);
                expect(context.cartelSpacer).toBeInZone('hand', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should leave Shadow Caster, Just Business with no When Defeated ability to use again', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['razor-crest#stay-off-the-ice', 'shadow-caster#just-business'],
                        groundArena: ['superlaser-technician']
                    },
                    player2: {
                        hand: ['rivals-fall']
                    }
                });

                const { context } = contextRef;
                const resourceCount = context.player1.resources.length;

                // Player 1 passes, then player 2 defeats Superlaser Technician
                context.player1.passAction();
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.superlaserTechnician);

                // Neither Superlaser Technician's When Defeated nor Shadow Caster's ability triggers
                expect(context.superlaserTechnician).toBeInZone('discard', context.player1);
                expect(context.player1.resources.length).toBe(resourceCount);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not affect Bounty abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['razor-crest#stay-off-the-ice'],
                        groundArena: ['guavian-antagonizer']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                // Player 1 attacks Wampa with Guavian Antagonizer and loses it
                context.player1.clickCard(context.guavianAntagonizer);
                context.player1.clickCard(context.wampa);

                // Player 2 collects the Bounty
                expect(context.guavianAntagonizer).toBeInZone('discard');
                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player2.clickPrompt('Trigger');

                expect(context.player2.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should leave Chimaera, Reinforcing the Center with no unit whose When Defeated ability can be used', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#reinforcing-the-center'],
                        spaceArena: ['razor-crest#stay-off-the-ice'],
                        groundArena: ['superlaser-technician']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Chimaera; there is no legal target for its ability
                context.player1.clickCard(context.chimaera);

                expect(context.chimaera).toBeInZone('spaceArena');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
