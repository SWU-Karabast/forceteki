describe('Poe Dameron, Hero of the Resistance', function () {
    integration(function (contextRef) {
        describe('Poe\'s triggered ability', function () {
            it('should get +1/+0 for this phase when playing another Resistance unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['determined-recruit'],
                        groundArena: ['poe-dameron#hero-of-the-resistance']
                    }
                });
                const { context } = contextRef;

                // Player 1 plays Determined Recruit, Poe gets +1/+0
                context.player1.clickCard(context.determinedRecruit);
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(3);
                expect(context.poeDameronHeroOfTheResistance.getHp()).toBe(4);

                context.player2.passAction();

                // Poe attacks the base with the bonus
                context.player1.clickCard(context.poeDameronHeroOfTheResistance);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
            });

            it('should stack the bonus for each Resistance card played this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'determined-recruit',
                            'kaydel-connix#keep-going'
                        ],
                        groundArena: ['poe-dameron#hero-of-the-resistance']
                    }
                });
                const { context } = contextRef;

                // Player 1 plays Determined Recruit
                context.player1.clickCard(context.determinedRecruit);
                context.player2.passAction();

                // Player 1 plays Kaydel Connix
                context.player1.clickCard(context.kaydelConnix);
                context.player2.passAction();

                // Poe has gained +1/+0 twice
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(4);

                // Poe attacks the base with the stacked bonus
                context.player1.clickCard(context.poeDameronHeroOfTheResistance);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should trigger when a Resistance pilot is played as an upgrade with Piloting', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['determined-recruit'],
                        groundArena: [
                            'poe-dameron#hero-of-the-resistance',
                            'atst'
                        ]
                    }
                });
                const { context } = contextRef;

                // Player 1 plays Determined Recruit as a pilot upgrade on AT-ST
                context.player1.clickCard(context.determinedRecruit);
                context.player1.clickPrompt('Play Determined Recruit with Piloting');
                context.player1.clickCard(context.atst);
                expect(context.atst).toHaveExactUpgradeNames(['determined-recruit']);
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(3);

                context.player2.passAction();

                // Poe attacks the base with the bonus
                context.player1.clickCard(context.poeDameronHeroOfTheResistance);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);
            });

            it('should trigger when a Resistance card is played from resources with Plot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['poe-dameron#hero-of-the-resistance'],
                        leader: 'chewbacca#walking-carpet',
                        resources: ['kaydel-connix#for-our-survival', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    }
                });
                const { context } = contextRef;

                const poeAbilityTitle = 'This unit gets +1/+0 for this phase';

                // Player 1 deploys Chewbacca and plays Kaydel Connix using Plot
                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Deploy Chewbacca');
                expect(context.player1).toHavePassAbilityPrompt('Play Kaydel Connix using Plot');
                context.player1.clickPrompt('Trigger');

                // Poe's trigger and Kaydel's When Played come from the same play
                expect(context.player1).toHaveExactPromptButtons([
                    poeAbilityTitle,
                    'Defeat all non-unique upgrades on a unit'
                ]);
                context.player1.clickPrompt(poeAbilityTitle);

                // No unit has upgrades, so Kaydel's ability has nothing to target
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(3);
                expect(context.kaydelConnix).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should lose the bonus at the end of the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['determined-recruit'],
                        groundArena: ['poe-dameron#hero-of-the-resistance']
                    }
                });
                const { context } = contextRef;

                // Player 1 plays Determined Recruit, Poe gets +1/+0
                context.player1.clickCard(context.determinedRecruit);
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(3);

                // Move to the next action phase, the bonus is gone
                context.moveToNextActionPhase();
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(2);

                // Poe attacks the base without the bonus
                context.player1.clickCard(context.poeDameronHeroOfTheResistance);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should not trigger when playing a non-Resistance card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'battlefield-marine',
                            'daring-raid'
                        ],
                        groundArena: ['poe-dameron#hero-of-the-resistance']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                // Player 1 plays Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player2.passAction();

                // Player 1 plays Daring Raid on Wampa
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);
                context.player2.passAction();

                // Poe has no bonus
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(2);

                // Poe attacks the base without the bonus
                context.player1.clickCard(context.poeDameronHeroOfTheResistance);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should not trigger when the opponent plays a Resistance card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['poe-dameron#hero-of-the-resistance']
                    },
                    player2: {
                        hand: ['determined-recruit']
                    }
                });
                const { context } = contextRef;

                // Player 2 plays Determined Recruit
                context.player1.passAction();
                context.player2.clickCard(context.determinedRecruit);
                expect(context.determinedRecruit).toBeInZone('groundArena', context.player2);

                // Poe has no bonus
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(2);

                // Poe attacks the base without the bonus
                context.player1.clickCard(context.poeDameronHeroOfTheResistance);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should not trigger from hand or on its own play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'determined-recruit',
                            'poe-dameron#hero-of-the-resistance'
                        ]
                    }
                });
                const { context } = contextRef;

                // Player 1 plays Determined Recruit while Poe is in hand
                context.player1.clickCard(context.determinedRecruit);
                context.player2.passAction();

                // Player 1 plays Poe, he gets no bonus
                context.player1.clickCard(context.poeDameronHeroOfTheResistance);
                expect(context.poeDameronHeroOfTheResistance).toBeInZone('groundArena');
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when a Resistance leader is deployed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['poe-dameron#hero-of-the-resistance'],
                        leader: 'rose-tico#saving-what-we-love',
                        resources: 6
                    }
                });
                const { context } = contextRef;

                // Player 1 deploys Rose Tico, Poe gets no bonus
                context.player1.clickCard(context.roseTico);
                context.player1.clickPrompt('Deploy Rose Tico');
                expect(context.roseTico).toBeInZone('groundArena');
                expect(context.poeDameronHeroOfTheResistance.getPower()).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
