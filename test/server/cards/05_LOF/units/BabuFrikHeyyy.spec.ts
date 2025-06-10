describe('Babu Frik, Heyyy!', function () {
    integration(function(contextRef) {
        describe('Babu Frik\'s action ability', function() {
            const prompt = 'You may attack with a friendly Droid unit. For this attack, it deals damage equal to its remaining HP instead of its power.';
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['huyang#enduring-instructor'],
                        groundArena: [
                            'babu-frik#heyyy',
                            { card: 'separatist-commando', upgrades: ['resilient'] }
                        ],
                        spaceArena: [
                            { card: 'devastating-gunship', damage: 4 }
                        ]
                    },
                    player2: {
                        hand: ['takedown', 'vanquish'],
                        groundArena: ['super-battle-droid']
                    }
                });
            });

            it('should allow a friendly Droid unit to attack with damage equal to its remaining HP', function () {
                const { context } = contextRef;

                // Player 1 uses Babu Frik's ability to attack with the Devastating Gunship
                context.player1.clickCard(context.babuFrik);
                expect(context.player1).toHaveExactPromptButtons([prompt, 'Attack', 'Cancel']);
                context.player1.clickPrompt(prompt);

                // Only the friendly Droid units should be available for attack
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.devastatingGunship,
                    context.separatistCommando
                ]);

                // Explicitly check the Gunship's power and HP before the attack
                expect(context.devastatingGunship.getPower()).toBe(7);
                expect(context.devastatingGunship.remainingHp).toBe(1);

                // Player 1 selects the Devastating Gunship to attack
                context.player1.clickCard(context.devastatingGunship);
                context.player1.clickCard(context.p2Base);

                expect(context.babuFrik.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(1);
            });

            it('incorporates HP modifiers into the damage calculation', function () {
                const { context } = contextRef;

                // Player 1 plays Huyang, buffing the Separatist Commando
                context.player1.clickCard(context.huyang);
                context.player1.clickCard(context.separatistCommando);

                // Verify the HP of the Separatist Commando after the buff
                expect(context.separatistCommando.getHp()).toBe(8); // 3 HP + 3 from Resilient + 2 from Huyang
                context.player2.passAction();

                // Player 1 uses Babu Frik's ability to attack
                context.player1.clickCard(context.babuFrik);
                expect(context.player1).toHaveExactPromptButtons([prompt, 'Attack', 'Cancel']);
                context.player1.clickPrompt(prompt);

                // Only the ready friendly Droid units should be available for attack
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.devastatingGunship,
                    context.separatistCommando
                ]);

                // Player 1 selects the Separatist Commando to attack
                context.player1.clickCard(context.separatistCommando);
                context.player1.clickCard(context.p2Base);

                // The damage dealt should be equal to the Commando's HP after the buff
                expect(context.babuFrik.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(8);
            });

            it('cannot be used if Babu Frik is exhausted', function () {
                const { context } = contextRef;

                // Attack with Babu Frik
                context.player1.clickCard(context.babuFrik);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);
                expect(context.babuFrik.exhausted).toBeTrue();
                context.player2.passAction();

                expect(context.babuFrik).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('can be be passed', function () {
                const { context } = contextRef;

                // Player 1 activates Babu Frik's ability
                context.player1.clickCard(context.babuFrik);
                expect(context.player1).toHaveExactPromptButtons([prompt, 'Attack', 'Cancel']);
                context.player1.clickPrompt(prompt);

                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.devastatingGunship,
                    context.separatistCommando
                ]);

                // Player 1 passes the action
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });

            it('has no effect if there are no friendly Droid units', function () {
                const { context } = contextRef;
                context.player1.passAction();

                // Defeat the two Droid units
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.devastatingGunship);
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.separatistCommando);

                // Player 1 activates Babu Frik's ability
                context.player1.clickCard(context.babuFrik);
                expect(context.player1).toHaveExactPromptButtons([prompt, 'Attack', 'Cancel']);
                context.player1.clickPrompt(prompt);

                // Player is warned that the ability has no effect
                expect(context.player1).toHavePrompt(`The ability "${prompt}" will have no effect. Are you sure you want to use it?`);
                context.player1.clickPrompt('Use it anyway');
                context.player1.clickPrompt('Trigger');

                expect(context.p2Base.damage).toBe(0);
                expect(context.babuFrik.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
