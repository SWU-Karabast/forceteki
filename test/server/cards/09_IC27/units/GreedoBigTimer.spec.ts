describe('Greedo, Big-Timer', function() {
    integration(function(contextRef) {
        const damageOrderPrompt = 'Multiple abilities conflict over combat damage timing. Choose which unit deals combat damage first:';
        const attackerButton = (title: string) => `${title} (attacker)`;
        const defenderButton = (title: string) => `${title} (defender)`;
        const damageOrderButtons = (attackerTitle: string, defenderTitle: string) => [attackerButton(attackerTitle), defenderButton(defenderTitle)];
        const waitingForDamageOrderPrompt = 'Waiting for opponent to choose which unit deals combat damage first';

        describe('Greedo\'s constant ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shoot-first'],
                        groundArena: ['greedo#bigtimer', 'battlefield-marine', 'han-solo#reluctant-hero', 'atst']
                    },
                    player2: {
                        groundArena: ['wampa', 'greedo#bigtimer']
                    }
                });

                const { context } = contextRef;
                context.p1Greedo = context.player1.findCardByName('greedo#bigtimer');
                context.p2Greedo = context.player2.findCardByName('greedo#bigtimer');
            });

            it('should make the defender deal combat damage first while Greedo is attacking', function() {
                const { context } = contextRef;

                // Player 1 attacks Wampa with Greedo
                context.player1.clickCard(context.p1Greedo);
                context.player1.clickCard(context.wampa);

                // Wampa deals 4 damage first, defeating Greedo before he can deal damage
                expect(context.p1Greedo).toBeInZone('discard');
                expect(context.wampa.damage).toBe(0);
                expect(context.getChatLogs(4)).toContain('Wampa (defender) deals combat damage before Greedo (attacker)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal combat damage normally while Greedo is attacking a base', function() {
                const { context } = contextRef;

                // Player 1 attacks the enemy base with Greedo
                context.player1.clickCard(context.p1Greedo);
                context.player1.clickCard(context.p2Base);

                // Assert Greedo deals damage normally with no damage order logged
                expect(context.p2Base.damage).toBe(5);
                expect(context.getChatLogs(4)).not.toContain(jasmine.stringContaining('deals combat damage before'));
                expect(context.player2).toBeActivePlayer();
            });

            it('should make the attacker deal combat damage first while Greedo is defending', function() {
                const { context } = contextRef;

                // Player 1 attacks the enemy Greedo with Battlefield Marine
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Greedo);

                // Battlefield Marine deals 3 damage first, defeating Greedo before he can deal damage
                expect(context.p2Greedo).toBeInZone('discard');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.getChatLogs(4)).toContain('Battlefield Marine (attacker) deals combat damage before Greedo (defender)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not prompt for damage order when the attacker deals combat damage first while Greedo is defending', function() {
                const { context } = contextRef;

                // Player 1 attacks the enemy Greedo with Han Solo
                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.p2Greedo);

                // Both effects agree that Han Solo deals damage first
                expect(context.p2Greedo).toBeInZone('discard');
                expect(context.hanSolo.damage).toBe(0);
                expect(context.getChatLogs(4)).toContain('Han Solo (attacker) deals combat damage before Greedo (defender)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal excess damage to the base when an attacker with Overwhelm defeats Greedo before he deals damage', function() {
                const { context } = contextRef;

                // Player 1 attacks the enemy Greedo with AT-ST
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Greedo);

                // AT-ST deals 6 damage first, defeating Greedo and dealing 3 excess damage to the base
                expect(context.p2Greedo).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(3);
                expect(context.atst.damage).toBe(0);
                expect(context.getChatLogs(4)).toContain('AT-ST (attacker) deals combat damage before Greedo (defender)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the attacking player choose for Greedo to deal combat damage first when he attacks with an effect to deal combat damage first', function() {
                const { context } = contextRef;

                // Player 1 plays Shoot First on Greedo and attacks Wampa
                context.player1.clickCard(context.shootFirst);
                context.player1.clickCard(context.p1Greedo);
                context.player1.clickCard(context.wampa);

                // Player 1 is prompted to choose the damage order
                expect(context.player1).toHavePrompt(damageOrderPrompt);
                expect(context.player1).toHaveExactPromptButtons(damageOrderButtons('Greedo', 'Wampa'));

                context.player1.clickPrompt(attackerButton('Greedo'));

                // Greedo deals 6 damage first (+1/+0 from Shoot First), defeating Wampa
                expect(context.wampa).toBeInZone('discard');
                expect(context.p1Greedo.damage).toBe(0);
                expect(context.getChatLogs(4)).toContain('player1 chooses for Greedo (attacker) to deal combat damage before Wampa (defender)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the attacking player choose for the defender to deal combat damage first when Greedo attacks with an effect to deal combat damage first', function() {
                const { context } = contextRef;

                // Player 1 plays Shoot First on Greedo and attacks Wampa
                context.player1.clickCard(context.shootFirst);
                context.player1.clickCard(context.p1Greedo);
                context.player1.clickCard(context.wampa);

                // Player 1 is prompted to choose the damage order
                expect(context.player1).toHavePrompt(damageOrderPrompt);
                expect(context.player1).toHaveExactPromptButtons(damageOrderButtons('Greedo', 'Wampa'));

                context.player1.clickPrompt(defenderButton('Wampa'));

                // Wampa deals 4 damage first, defeating Greedo before he can deal damage
                expect(context.p1Greedo).toBeInZone('discard');
                expect(context.wampa.damage).toBe(0);
                expect(context.getChatLogs(4)).toContain('player1 chooses for Wampa (defender) to deal combat damage before Greedo (attacker)');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When Greedo attacks an enemy Greedo', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['greedo#bigtimer']
                    },
                    player2: {
                        groundArena: ['greedo#bigtimer']
                    }
                });

                const { context } = contextRef;
                context.p1Greedo = context.player1.findCardByName('greedo#bigtimer');
                context.p2Greedo = context.player2.findCardByName('greedo#bigtimer');
            });

            it('should let the attacking player choose for the attacker to deal combat damage first', function() {
                const { context } = contextRef;

                // Player 1 attacks the enemy Greedo with Greedo
                context.player1.clickCard(context.p1Greedo);
                context.player1.clickCard(context.p2Greedo);

                // Player 1 is prompted to choose the damage order
                expect(context.player1).toHavePrompt(damageOrderPrompt);
                expect(context.player1).toHaveExactPromptButtons(damageOrderButtons('Greedo', 'Greedo'));
                expect(context.player2).toHavePrompt(waitingForDamageOrderPrompt);

                context.player1.clickPrompt(attackerButton('Greedo'));

                // Assert the attacking Greedo deals damage first
                expect(context.p2Greedo).toBeInZone('discard');
                expect(context.p1Greedo.damage).toBe(0);
                expect(context.getChatLogs(4)).toContain('player1 chooses for Greedo (attacker) to deal combat damage before Greedo (defender)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the attacking player choose for the defender to deal combat damage first', function() {
                const { context } = contextRef;

                // Player 1 attacks the enemy Greedo with Greedo
                context.player1.clickCard(context.p1Greedo);
                context.player1.clickCard(context.p2Greedo);

                // Player 1 is prompted to choose the damage order
                expect(context.player1).toHavePrompt(damageOrderPrompt);
                expect(context.player1).toHaveExactPromptButtons(damageOrderButtons('Greedo', 'Greedo'));

                context.player1.clickPrompt(defenderButton('Greedo'));

                // Assert the defending Greedo deals damage first
                expect(context.p1Greedo).toBeInZone('discard');
                expect(context.p2Greedo.damage).toBe(0);
                expect(context.getChatLogs(4)).toContain('player1 chooses for Greedo (defender) to deal combat damage before Greedo (attacker)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the opponent choose the damage order when they are the attacking player', function() {
                const { context } = contextRef;

                // Player 1 passes, then player 2 attacks with Greedo
                context.player1.passAction();
                context.player2.clickCard(context.p2Greedo);
                context.player2.clickCard(context.p1Greedo);

                // Player 2 is prompted to choose the damage order
                expect(context.player2).toHavePrompt(damageOrderPrompt);
                expect(context.player2).toHaveExactPromptButtons(damageOrderButtons('Greedo', 'Greedo'));
                expect(context.player1).toHavePrompt(waitingForDamageOrderPrompt);

                context.player2.clickPrompt(attackerButton('Greedo'));

                // Assert player 2's attacking Greedo deals damage first
                expect(context.p1Greedo).toBeInZone('discard');
                expect(context.p2Greedo.damage).toBe(0);
                expect(context.getChatLogs(4)).toContain('player2 chooses for Greedo (attacker) to deal combat damage before Greedo (defender)');
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('When The Stranger ambushes Greedo', function() {
            const strangerPrompt = 'Choose how damage is dealt for this attack';
            const strangerDefenderFirstButton = 'Defender deals damage first';
            const dealDamageNormallyButton = 'Deal damage normally';

            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-stranger#no-survivors']
                    },
                    player2: {
                        groundArena: ['greedo#bigtimer']
                    }
                });
            });

            it('should let the attacking player choose for Greedo to deal combat damage first when The Stranger also makes the defender deal damage first', function() {
                const { context } = contextRef;

                // Player 1 plays The Stranger and ambushes Greedo
                context.player1.clickCard(context.theStranger);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.greedo);

                // Player 1 chooses how The Stranger's damage is dealt
                expect(context.player1).toHavePrompt(strangerPrompt);
                context.player1.clickPrompt(strangerDefenderFirstButton);

                // Conflicting effects prompt player 1 to choose the damage order
                expect(context.player1).toHavePrompt(damageOrderPrompt);
                expect(context.player1).toHaveExactPromptButtons(damageOrderButtons('The Stranger', 'Greedo'));
                expect(context.player2).toHavePrompt(waitingForDamageOrderPrompt);

                context.player1.clickPrompt(defenderButton('Greedo'));

                // Greedo deals 5 damage first, giving The Stranger 6 power from Grit to defeat Greedo
                expect(context.theStranger.damage).toBe(5);
                expect(context.greedo).toBeInZone('discard');
                expect(context.getChatLogs(4)).toContain('player1 chooses for Greedo (defender) to deal combat damage before The Stranger (attacker)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should let the attacking player choose for The Stranger to deal combat damage first despite The Stranger\'s defender-first choice', function() {
                const { context } = contextRef;

                // Player 1 plays The Stranger and ambushes Greedo
                context.player1.clickCard(context.theStranger);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.greedo);

                // Player 1 chooses how The Stranger's damage is dealt
                expect(context.player1).toHavePrompt(strangerPrompt);
                context.player1.clickPrompt(strangerDefenderFirstButton);

                // Conflicting effects prompt player 1 to choose the damage order
                expect(context.player1).toHavePrompt(damageOrderPrompt);
                expect(context.player1).toHaveExactPromptButtons(damageOrderButtons('The Stranger', 'Greedo'));

                context.player1.clickPrompt(attackerButton('The Stranger'));

                // The Stranger deals 1 damage first, then Greedo deals 5 damage back
                expect(context.greedo.damage).toBe(1);
                expect(context.theStranger.damage).toBe(5);
                expect(context.getChatLogs(4)).toContain('player1 chooses for The Stranger (attacker) to deal combat damage before Greedo (defender)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not prompt for damage order when The Stranger deals damage normally', function() {
                const { context } = contextRef;

                // Player 1 plays The Stranger and ambushes Greedo
                context.player1.clickCard(context.theStranger);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.greedo);

                // Player 1 chooses how The Stranger's damage is dealt
                expect(context.player1).toHavePrompt(strangerPrompt);
                context.player1.clickPrompt(dealDamageNormallyButton);

                // Greedo deals damage after The Stranger, so Grit has no effect on The Stranger's damage
                expect(context.greedo.damage).toBe(1);
                expect(context.theStranger.damage).toBe(5);
                expect(context.getChatLogs(4)).toContain('The Stranger (attacker) deals combat damage before Greedo (defender)');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When Greedo is one of multiple defenders', function() {
            const improvisedIdentityTitle = 'Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.';

            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'dinosaur-turtle', upgrades: ['improvised-identity'] },
                            { card: 'greedo#bigtimer', upgrades: ['improvised-identity'] }
                        ],
                        deck: ['darth-maul#revenge-at-last', 'cartel-spacer', 'takedown']
                    },
                    player2: {
                        groundArena: ['greedo#bigtimer', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;
                context.p1Greedo = context.player1.findCardByName('greedo#bigtimer');
                context.p2Greedo = context.player2.findCardByName('greedo#bigtimer');
            });

            it('should have only Greedo deal combat damage after the attacker', function() {
                const { context } = contextRef;

                // Dinosaur Turtle discards Darth Maul to attack both Greedo and Battlefield Marine
                context.player1.clickCard(context.dinosaurTurtle);
                context.player1.clickPrompt(improvisedIdentityTitle);
                context.player1.clickCardInDisplayCardPrompt(context.darthMaul);
                context.player1.clickCard(context.p2Greedo);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();

                // Battlefield Marine deals damage alongside Dinosaur Turtle, which defeats Greedo before he can deal damage
                expect(context.p2Greedo).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.dinosaurTurtle.damage).toBe(3);
                expect(context.getChatLogs(4)).toContain('Dinosaur Turtle (attacker) deals combat damage before Greedo (defender)');
                expect(context.getChatLogs(4)).not.toContain(jasmine.stringContaining('Battlefield Marine (defender)'));
                expect(context.player2).toBeActivePlayer();
            });

            it('should prompt only for the conflicting defender, and let the attacker deal damage between the two defenders', function() {
                const { context } = contextRef;

                // Greedo discards Darth Maul to attack both the enemy Greedo and Battlefield Marine
                context.player1.clickCard(context.p1Greedo);
                context.player1.clickPrompt(improvisedIdentityTitle);
                context.player1.clickCardInDisplayCardPrompt(context.darthMaul);
                context.player1.clickCard(context.p2Greedo);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();

                // Player 1 is prompted to choose the damage order for the enemy Greedo only
                expect(context.player1).toHavePrompt(damageOrderPrompt);
                expect(context.player1).toHaveExactPromptButtons(damageOrderButtons('Greedo', 'Greedo'));

                context.player1.clickPrompt(attackerButton('Greedo'));

                // Battlefield Marine deals 3 damage first, then Greedo defeats both defenders before the enemy Greedo deals damage
                expect(context.p2Greedo).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.p1Greedo.damage).toBe(3);
                expect(context.getChatLogs(5)).toContain('Battlefield Marine (defender) deals combat damage before Greedo (attacker)');
                expect(context.getChatLogs(5)).toContain('player1 chooses for Greedo (attacker) to deal combat damage before Greedo (defender)');
                expect(context.player2).toBeActivePlayer();
            });

            it('should let both defenders deal combat damage before the attacker when the defender is chosen to go first', function() {
                const { context } = contextRef;

                // Greedo discards Darth Maul to attack both the enemy Greedo and Battlefield Marine
                context.player1.clickCard(context.p1Greedo);
                context.player1.clickPrompt(improvisedIdentityTitle);
                context.player1.clickCardInDisplayCardPrompt(context.darthMaul);
                context.player1.clickCard(context.p2Greedo);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();

                // Player 1 is prompted to choose the damage order for the enemy Greedo only
                expect(context.player1).toHavePrompt(damageOrderPrompt);
                expect(context.player1).toHaveExactPromptButtons(damageOrderButtons('Greedo', 'Greedo'));

                context.player1.clickPrompt(defenderButton('Greedo'));

                // Both defenders deal 8 damage together first, defeating Greedo before he can deal damage
                expect(context.p1Greedo).toBeInZone('discard');
                expect(context.p2Greedo.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.getChatLogs(5)).toContain('Battlefield Marine (defender) deals combat damage before Greedo (attacker)');
                expect(context.getChatLogs(5)).toContain('player1 chooses for Greedo (defender) to deal combat damage before Greedo (attacker)');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
