describe('Brothers', function () {
    integration(function (contextRef) {
        describe('Brothers\' ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['brothers'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'battlefield-marine'],
                        spaceArena: [
                            'mist-hunter#the-findsmans-pursuit',
                            { card: 'red-five#running-the-trench', damage: 1 },
                        ],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa', 'shin-hati#overeager-apprentice'],
                        spaceArena: ['cartel-spacer', 'tie-bomber']
                    }
                });
            });

            it('should initiate attacks with 2 unique units, preventing combat damage to those units', function () {
                const { context } = contextRef;

                // Play Brothers
                context.player1.clickCard(context.brothers);

                expect(context.player1).toHavePrompt('Attack with a unique unit. Prevent all combat damage that would be dealt to it for this attack');
                expect(context.player1).toBeAbleToSelectExactly([
                    // Only friendly unique units should are valid targets
                    context.mistHunter,
                    context.redFive,
                    context.grandInquisitor,
                    context.chirrutImwe
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Select Mist Hunter for the first attack
                context.player1.clickCard(context.mistHunter);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.mistHunter.damage).toBe(0);
                expect(context.cartelSpacer).toBeInZone('discard');

                expect(context.player1).toHavePrompt('Attack with another unique unit. Prevent all combat damage that would be dealt to it for this attack');
                expect(context.player1).toBeAbleToSelectExactly([
                    // For the second attack, the first attacker is no longer a valid target
                    context.redFive,
                    context.grandInquisitor,
                    context.chirrutImwe
                ]);
                expect(context.player1).toHavePassAbilityButton();

                // Select Grand Inquisitor for the second attack
                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickCard(context.wampa);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.wampa.damage).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow passing the second attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.brothers);
                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickCard(context.wampa);
                expect(context.grandInquisitor.damage).toBe(0);
                expect(context.wampa.damage).toBe(4);
                expect(context.player1).toBeAbleToSelectExactly([context.redFive, context.mistHunter, context.chirrutImwe]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow passing both attacks', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.brothers);
                expect(context.player1).toBeAbleToSelectExactly([context.redFive, context.mistHunter, context.grandInquisitor, context.chirrutImwe]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');

                expect(context.player1).toBeAbleToSelectExactly([context.redFive, context.mistHunter, context.grandInquisitor, context.chirrutImwe]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('does not prevent non-combat damage during the attack (Red Five damages itself)', function () {
                const { context } = contextRef;

                // Play Brothers
                context.player1.clickCard(context.brothers);

                // Select Red Five for the first attack
                context.player1.clickCard(context.redFive);
                context.player1.clickCard(context.tieBomber);

                // Resolve Red Five's On Attack and choose to damage itself
                expect(context.player1).toHavePrompt('Deal 2 damage to a damaged unit');
                context.player1.clickCard(context.redFive);

                expect(context.redFive.damage).toBe(3); // Received damage from its own ability
                expect(context.tieBomber.damage).toBe(3);

                // Pass the second attack
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should not be able to select the same unit for both attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['brothers'],
                    groundArena: ['000#translation-and-torture', { card: 'sebulbas-podracer#taking-the-lead', upgrades: ['hans-golden-dice'] }],
                    deck: ['surprise-strike', 'echo#restored', 'green-squadron-awing', 'daring-raid', 'sudden-ferocity']
                },
                player2: {
                    discard: ['wolffe#suspicious-veteran']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.brothers);
            context.player1.clickCard(context.sebulbasPodracer);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Trigger');

            expect(context.sebulbasPodracer.exhausted).toBe(false);
            expect(context.player1).toBeAbleToSelectExactly(context._000);
            context.player1.clickCard(context._000);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();
        });

        it('has no effect if no unique friendly units are in play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['brothers'],
                    groundArena: ['death-star-stormtrooper'],
                    spaceArena: ['tieln-fighter']
                },
                player2: {
                    groundArena: ['shin-hati#overeager-apprentice']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.brothers);

            // TODO: We don't get this prompt because the event ability itself is optional ("up to two")
            // expect(context.player1).toHavePrompt('Playing Brothers will have no effect. Are you sure you want to play it?');
            // expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);
            // context.player1.clickPrompt('Play anyway');

            expect(context.player2).toBeActivePlayer();
        });
    });
});