describe('Bossk, Hunting his Prey', function () {
    integration(function (contextRef) {
        describe('Bossk\'s leader deployed ability', function () {
            it('should be able to collect a Bounty a second time (for "simple" bounty effects)', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#hunting-his-prey', deployed: true },
                        groundArena: ['clone-deserter']
                    },
                    player2: {
                        groundArena: [
                            'hylobon-enforcer',
                            'guavian-antagonizer',
                            { card: 'jyn-erso#stardust', upgrades: ['guild-target'] },
                            { card: 'clone-trooper', upgrades: ['death-mark'] },
                            'wanted-insurgents',
                            { card: 'trandoshan-hunters', upgrades: ['top-target'] }
                        ],
                        hand: ['vanquish']
                    },
                });

                const { context } = contextRef;

                function resetPhase() {
                    context.setDamage(context.bossk, 0);
                    context.moveToNextActionPhase();
                }

                function resetAttack() {
                    context.bossk.exhausted = false;
                    context.setDamage(context.bossk, 0);
                }

                // CASE 1: simple ability with no target (draw a card)
                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.hylobonEnforcer);

                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player1.clickPrompt('Collect Bounty: Draw a card');
                expect(context.player1.handSize).toBe(1);
                expect(context.player2.handSize).toBe(1);

                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1.handSize).toBe(2);
                expect(context.player2.handSize).toBe(1);

                // CASE 2: confirm the per-round limit
                resetAttack();

                context.player2.clickCard(context.guavianAntagonizer);
                context.player2.clickCard(context.bossk);
                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player1.clickPrompt('Collect Bounty: Draw a card');
                expect(context.player1.handSize).toBe(3);
                expect(context.player2.handSize).toBe(1);

                expect(context.player1).toBeActivePlayer();

                resetPhase();

                // CASE 3: check that opponent resolving a Bounty on our unit does not trigger Bossk ability
                context.player1.passAction();

                const p2HandSizePhase2 = context.player2.handSize;

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.cloneDeserter);
                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player2.clickPrompt('Collect Bounty: Draw a card');
                expect(context.player2.handSize).toBe(p2HandSizePhase2);   // played Vanquish then drew a card
                expect(context.player1).toBeActivePlayer();

                // CASE 4: targeted ability with a condition (uniqueness)
                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.jynErso);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(3);

                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);

                resetPhase();

                context.player1.exhaustResources(3);

                // CASE 5: not collecting the Bounty does not trigger Bossk (bounty with no target resolver)
                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw 2 cards');
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();

                resetAttack();

                // CASE 6: not collecting the Bounty does not trigger Bossk (bounty with target resolver)
                context.player2.clickCard(context.wantedInsurgents);
                context.player2.clickCard(context.bossk);
                expect(context.player1).toBeAbleToSelectExactly([context.bossk, context.trandoshanHunters]);
                context.player1.clickPrompt('Pass ability');
                expect(context.player1).toBeActivePlayer();

                resetPhase();

                // CASE 7: Bossk dies in the attack, his ability does not trigger
                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.trandoshanHunters);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);  // 6 damage - 4 b/c unit is not unique

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Bossk\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#hunting-his-prey', deployed: true },
                        groundArena: ['wampa'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'protector', 'snowtrooper-lieutenant', 'inferno-four#unforgetting'],
                    },
                    player2: {
                        groundArena: [{ card: 'clone-trooper', upgrades: ['bounty-hunters-quarry'] }, 'clone-deserter']
                    },
                });
            });

            it('should be able to collect a "search for a card" Bounty a second time which activates a "when played" ability', function() {
                const { context } = contextRef;
                const prompt = 'Collect Bounty: Search the top 5 cards of your deck, or 10 cards instead if this unit is unique, for a unit that costs 3 or less and play it for free.';

                // first Bounty trigger
                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);
                expect(context.player1).toHaveEnabledPromptButtons([context.battlefieldMarine.title, context.snowtrooperLieutenant.title, context.sabineWren.title, 'Take nothing']);
                expect(context.player1).toHaveDisabledPromptButtons([context.waylay, context.protector.title]);

                context.player1.clickPrompt(context.battlefieldMarine.title);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect([context.sabineWren, context.waylay, context.snowtrooperLieutenant, context.protector]).toAllBeInBottomOfDeck(context.player1, 4);

                // second Bounty trigger, play a unit that has a "when played" which triggers an attack
                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1).toHaveEnabledPromptButtons([context.infernoFour.title, context.sabineWren.title, context.snowtrooperLieutenant.title, 'Take nothing']);
                expect(context.player1).toHaveDisabledPromptButtons([context.waylay, context.protector.title]);

                context.player1.clickPrompt(context.snowtrooperLieutenant.title);
                expect(context.snowtrooperLieutenant).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                // do the attack, trigger _another_ bounty
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.cloneDeserter);
                expect([context.sabineWren, context.waylay, context.infernoFour, context.protector]).toAllBeInBottomOfDeck(context.player1, 4);

                // resolve the Clone Deserter bounty
                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player1.clickPrompt('Collect Bounty: Draw a card');
                expect(context.player1.handSize).toBe(1);
            });

            // TODO: waiting on the judge chat for this one
            // it('should be able to collect a "search for a card" Bounty a second time', function() {
            //     const { context } = contextRef;
            //     const prompt = 'Collect Bounty: Search the top 5 cards of your deck, or 10 cards instead if this unit is unique, for a unit that costs 3 or less and play it for free.';

            //     // first Bounty trigger: Bounty Hunter's Quarry, play a unit that has a "when played" which triggers an attack
            //     context.player1.clickCard(context.bossk);
            //     context.player1.clickCard(context.cloneTrooper);
            //     expect(context.player1).toHavePassAbilityPrompt(prompt);
            //     context.player1.clickPrompt(prompt);
            //     expect(context.player1).toHaveEnabledPromptButtons([context.battlefieldMarine.title, context.snowtrooperLieutenant.title, context.sabineWren.title, 'Take nothing']);
            //     expect(context.player1).toHaveDisabledPromptButtons([context.waylay, context.protector.title]);

            //     context.player1.clickPrompt(context.snowtrooperLieutenant.title);
            //     expect(context.snowtrooperLieutenant).toBeInZone('groundArena');
            //     expect(context.player1.exhaustedResourceCount).toBe(0);

            //     // do the attack, trigger _another_ bounty
            //     expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            //     expect(context.player1).toHavePassAbilityButton();
            //     context.player1.clickCard(context.wampa);
            //     context.player1.clickCard(context.cloneDeserter);

            //     // resolve the Clone Deserter bounty
            //     expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
            //     context.player1.clickPrompt('Collect Bounty: Draw a card');
            //     expect(context.player1.handSize).toBe(1);

            //     // activate Bossk ability here to re-collect the Clone Deserter bounty, using up the per-round limit so we can't activate BHQ's Bounty again
            //     expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
            //     context.player1.clickPrompt('Collect the Bounty again');
            //     expect(context.player1.handSize).toBe(2);

            //     expect(context.player2).toBeActivePlayer();
            // });
        });

        // TODO: test Jabba bounty
        // TODO: test "resource top card of deck" bounty
        // TODO: test can still activate ability if bounty was "collected" but had no effect
    });
});
