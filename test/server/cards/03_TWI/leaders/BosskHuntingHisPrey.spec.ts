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
                            'wanted-insurgents'
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
                expect(context.player1).toBeAbleToSelectExactly([context.bossk]);
                context.player1.clickPrompt('Pass ability');
                expect(context.player1).toBeActivePlayer();
            });

            it('should be able to collect a "search for a card" Bounty a second time', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#hunting-his-prey', deployed: true },
                        groundArena: ['clone-deserter'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'protector', 'inferno-four#unforgetting', 'echo-base-defender'],
                    },
                    player2: {
                        groundArena: [{ card: 'clone-trooper', upgrades: ['bounty-hunters-quarry'] }]
                    },
                });

                const { context } = contextRef;
                const prompt = 'Collect Bounty: Search the top 5 cards of your deck, or 10 cards instead if this unit is unique, for a unit that costs 3 or less and play it for free.';

                // first Bounty trigger
                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);
                expect(context.player1).toHaveEnabledPromptButtons([context.battlefieldMarine.title, context.infernoFour.title, context.sabineWren.title, 'Take nothing']);
                expect(context.player1).toHaveDisabledPromptButtons([context.waylay, context.protector.title]);

                context.player1.clickPrompt(context.battlefieldMarine.title);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                expect(context.sabineWren).toBeInBottomOfDeck(context.player1, 4);
                expect(context.waylay).toBeInBottomOfDeck(context.player1, 4);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 4);
                expect(context.protector).toBeInBottomOfDeck(context.player1, 4);

                // second Bounty trigger
                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1).toHaveEnabledPromptButtons([context.infernoFour.title, context.sabineWren.title, context.echoBaseDefender.title, 'Take nothing']);
                expect(context.player1).toHaveDisabledPromptButtons([context.waylay, context.protector.title]);

                context.player1.clickPrompt(context.sabineWren.title);
                expect(context.sabineWren).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 4);
                expect(context.waylay).toBeInBottomOfDeck(context.player1, 4);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 4);
                expect(context.protector).toBeInBottomOfDeck(context.player1, 4);
            });
        });
    });
});
