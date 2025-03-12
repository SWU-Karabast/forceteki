describe('The Ghost, Heart of the Family', () => {
    integration(function(contextRef) {
        it('gains sentinel when it is upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['academy-training'],
                    spaceArena: ['the-ghost#heart-of-the-family']
                },
                player2: {
                    spaceArena: ['tieln-fighter'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            // Player 2 can attack base because Ghost is not a Sentinel
            context.player2.clickCard(context.tielnFighter);
            expect(context.player2).toBeAbleToSelectExactly([
                context.theGhost,
                context.p1Base
            ]);

            context.player2.clickCard(context.p1Base);

            // Play an upgrade on The Ghost
            context.player1.clickCard(context.academyTraining);
            context.player1.clickCard(context.theGhost);
            context.moveToNextActionPhase();

            // Player 2 can't attack base because Ghost is a Sentinel
            context.player2.clickCard(context.tielnFighter);
            expect(context.player2).toBeAbleToSelectExactly([
                context.theGhost
            ]);

            context.player2.clickCard(context.theGhost);
            expect(context.theGhost.damage).toBe(2);
        });

        describe('When The Ghost gains', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: [
                            'infiltrators-skill',
                            'red-three#unstoppable',
                            'home-one#alliance-flagship',
                            'wedge-antilles#star-of-the-rebellion',
                            'admiral-yularen#fleet-coordinator'
                        ],
                        spaceArena: [
                            'the-ghost#heart-of-the-family',
                            'phantom-ii#modified-to-dock',
                        ],
                        groundArena: ['sabine-wren#explosives-artist', 'battlefield-marine'],
                    },
                    player2: {
                        hand: [
                            'takedown',
                            'daring-raid',
                            'top-target',
                            'chopper#metal-menace',
                            'specforce-soldier'
                        ],
                        groundArena: ['cloud-city-wing-guard']
                    }
                });
            });

            it('Sentinel & Saboteur, it shares those keywords with other friendly Spectre units', function() {
                const { context } = contextRef;

                // Sabine must attack the Sentinel
                context.player1.clickCard(context.sabineWren);
                expect(context.player1).toBeAbleToSelectExactly([context.cloudCityWingGuard]);
                context.player1.clickCard(context.cloudCityWingGuard);
                context.player1.clickCard(context.p2Base); // Resolve Sabine's ability

                // Cloud City Wing Guard can attack base because Sabine is not Sentinel
                context.player2.clickCard(context.cloudCityWingGuard);
                expect(context.player2).toBeAbleToSelect(context.p1Base);
                context.player2.clickCard(context.p1Base);

                context.moveToNextActionPhase();
                context.sabineWren.damage = 0;
                context.cloudCityWingGuard.damage = 0;

                // Play Infiltrator's Skill on The Ghost, giving it Sentinel & Saboteur
                context.player1.clickCard(context.infiltratorsSkill);
                context.player1.clickCard(context.theGhost);

                // Cloud City Wing Guard can't attack base because Sabine is Sentinel
                context.player2.clickCard(context.cloudCityWingGuard);
                expect(context.player2).toBeAbleToSelectExactly([context.sabineWren]);
                context.player2.clickCard(context.sabineWren);

                // Sabine can attack the base because she has Saboteur
                context.player1.clickCard(context.sabineWren);
                expect(context.player1).toBeAbleToSelectExactly([context.cloudCityWingGuard, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Deal 1 damage to the defender or a base'); // Resolve Sabine's ability
                context.player1.clickCard(context.p2Base);
            });

            it('Raid 1, it shares that keyword with other friendly Spectre units', function() {
                const { context } = contextRef;

                // Play Red Three to give other Heroism units Raid 1
                context.player1.clickCard(context.redThree);
                context.player2.passAction();

                // Sabine should have Raid 2, attacking for 4
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.cloudCityWingGuard);
                context.player1.clickCard(context.p2Base); // Resolve Sabine's ability
                expect(context.cloudCityWingGuard).toBeInZone('discard');
            });

            it('Restore 1, it shares that keyword with other friendly Spectre units', function() {
                const { context } = contextRef;

                // Play Home One to give other Rebel units Restore 1
                context.player1.clickCard(context.homeOne);

                // Cloud City Wing Guard attacks base, dealing 2 damage
                context.player2.clickCard(context.cloudCityWingGuard);
                context.player2.clickCard(context.p1Base);

                // Sabine should have Restore 2, healing for 2
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.cloudCityWingGuard);
                context.player1.clickPrompt('Deal 1 damage to the defender or a base'); // Resolve Sabine's ability
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(0);
            });

            it('Ambush, it shares that keyword with other friendly Spectre units, including leaders', function() {
                const { context } = contextRef;

                // Play Wedge Antilles to give other Vehicle units Ambush
                context.player1.clickCard(context.wedgeAntilles);
                context.player2.passAction();

                // Deploy Hera Syndulla, she gains Ambush via The Ghost
                context.player1.clickCard(context.heraSyndulla);
                expect(context.player1).toHavePrompt('Trigger the ability \'Ambush\' or pass');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.cloudCityWingGuard);
                context.player1.clickCard(context.sabineWren); // Resolve Hera's ability
            });

            it('Grit, it shares that keyword with other friendly Spectre units', function() {
                const { context } = contextRef;

                // Attach Phantom II to give The Ghost Grit
                context.player1.clickCard(context.phantomIi);
                context.player1.clickPrompt('Attach this as an upgrade to The Ghost');
                context.player1.clickCard(context.theGhost);

                // Play Daring Raid to deal damage to Sabine
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.sabineWren);

                // Attack with Sabine, she deals 4 damage due to Grit
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.cloudCityWingGuard);
                context.player1.clickCard(context.p2Base); // Resolve Sabine's ability

                expect(context.cloudCityWingGuard).toBeInZone('discard');
            });

            it('Shielded, it shares that keyword with other friendly Spectre units', function() {
                const { context } = contextRef;

                // Play Admiral Yularen and give all Vehicles Shielded
                context.player1.clickCard(context.admiralYularen);
                context.player1.clickPrompt('Shielded');

                context.player2.passAction();

                // Deploy Hera Syndulla, she gains Shielded via The Ghost
                context.player1.clickCard(context.heraSyndulla);
                expect(context.heraSyndulla).toHaveExactUpgradeNames(['shield']);
            });

            it('a Bounty, it shares that keyword with other friendly Spectre units', function() {
                const { context } = contextRef;

                // Attack base with The Ghost
                context.player1.clickCard(context.theGhost);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);

                // Play Top Target on The Ghost to give it a Bounty
                context.player2.clickCard(context.topTarget);
                context.player2.clickCard(context.theGhost);

                context.player1.passAction();

                // Play Takedown on Sabine and collect the Bounty to heal the base
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.sabineWren);

                expect(context.player2).toHavePrompt('Collect Bounty: Heal 4 damage from a unit or base. If the Bounty unit is unique, heal 6 damage instead.');
                context.player2.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(0);
            });

            it('keywords, it does not share them with friendly non-Spectre units', function() {
                const { context } = contextRef;

                // Play Infiltrator's Skill on The Ghost, giving it Sentinel & Saboteur
                context.player1.clickCard(context.infiltratorsSkill);
                context.player1.clickCard(context.theGhost);

                // Cloud City Wing Guard connot attack Battlefied Marine because Sabine is Sentinel and BM is not
                context.player2.clickCard(context.cloudCityWingGuard);
                expect(context.player2).not.toBeAbleToSelect(context.battlefieldMarine);
                context.player2.clickCard(context.sabineWren);

                // Battlefield Marine cannot attack base because it does not have Saboteur
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).not.toBeAbleToSelect(context.p2Base);
                context.player1.clickCard(context.cloudCityWingGuard);
            });

            it('keywords, it does not share them with enemy Spectre units', function() {
                const { context } = contextRef;

                // Play Wedge Antilles to give other Vehicle units Ambush
                context.player1.clickCard(context.wedgeAntilles);

                // Plyer 2 plays Chopper, it does not gain Ambush from The Ghost
                context.player2.clickCard(context.chopper);
                expect(context.player2).not.toHavePrompt('Trigger the ability \'Ambush\' or pass');

                context.moveToNextActionPhase();

                // Play Infiltrator's Skill on The Ghost, giving it Sentinel & Saboteur
                context.player1.clickCard(context.infiltratorsSkill);
                context.player1.clickCard(context.theGhost);

                // Chopper does not have Saboteur, so it must attack Sabine
                context.player2.clickCard(context.chopper);
                expect(context.player2).toBeAbleToSelectExactly([context.sabineWren]);
                context.player2.clickCard(context.sabineWren);

                // Chopper does not have Sentinel, so Battlefied Marine must attack Cloud City Wing Guard
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.cloudCityWingGuard]);
                context.player1.clickCard(context.cloudCityWingGuard);
            });

            it('a keyword, then loses it, other friendly Spectre units lose that keyword too', function() {
                const { context } = contextRef;

                // Play Infiltrator's Skill on The Ghost, giving it Sentinel & Saboteur
                context.player1.clickCard(context.infiltratorsSkill);
                context.player1.clickCard(context.theGhost);

                // Play SpecForce Soldier, removing Sentinel from The Ghost
                context.player2.clickCard(context.specforceSoldier);
                context.player2.clickCard(context.theGhost);

                // Sabine can attack base because she still has Saboteur
                context.player1.clickCard(context.sabineWren);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.cloudCityWingGuard, context.specforceSoldier]);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Deal 1 damage to the defender or a base'); // Resolve Sabine's ability
                context.player1.clickCard(context.p2Base);

                // Cloud City Wing Guard can attack base because Sabine is not Sentinel
                context.player2.clickCard(context.cloudCityWingGuard);
                expect(context.player2).toBeAbleToSelect(context.p1Base);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});