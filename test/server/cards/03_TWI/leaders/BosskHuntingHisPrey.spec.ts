describe('Bossk, Hunting his Prey', function () {
    integration(function (contextRef) {
        it('Bossk\'s leader undeployed ability should deal 1 damage to a unit with a bounty and optionally give +1/+0', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: 'bossk#hunting-his-prey',
                    spaceArena: ['cartel-turncoat'],
                    resources: 4
                },
                player2: {
                    groundArena: [{ card: 'clone-trooper', upgrades: ['public-enemy'] }, 'wampa']
                }
            });

            const { context } = contextRef;

            // CASE 1: deal 1 damage and resolve optional +1/+0
            context.player1.clickCard(context.bossk);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat, context.cloneTrooper]);
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.cloneTrooper);
            expect(context.cloneTrooper.damage).toBe(1);

            // resolve optional +1/+0
            expect(context.player1).toHavePassAbilityPrompt('Give it +1/+0 for this phase');
            context.player1.clickPrompt('Give it +1/+0 for this phase');
            expect(context.cloneTrooper.getPower()).toBe(3);
            expect(context.cloneTrooper.getHp()).toBe(2);

            expect(context.bossk.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();

            context.moveToNextActionPhase();

            // check that +power effect has fallen off
            expect(context.cloneTrooper.getPower()).toBe(2);
            expect(context.cloneTrooper.getHp()).toBe(2);

            // CASE 2: deal 1 damage and don't resolve +1/+0
            context.player1.clickCard(context.bossk);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat, context.cloneTrooper]);
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.cartelTurncoat);
            expect(context.cartelTurncoat.damage).toBe(1);
            expect(context.player1).toHavePassAbilityPrompt('Give it +1/+0 for this phase');
            context.player1.clickPrompt('Pass');

            expect(context.bossk.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();

            context.moveToNextActionPhase();

            // CASE 3: deal 1 damage and defeat bounty unit
            context.player1.clickCard(context.bossk);
            expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat, context.cloneTrooper]);
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.cloneTrooper);
            expect(context.cloneTrooper).toBeInZone('outsideTheGame');
            expect(context.player1).toHavePassAbilityPrompt('Give it +1/+0 for this phase');
            context.player1.clickPrompt('Pass');

            expect(context.player1).toBeAbleToSelectExactly([context.cartelTurncoat, context.wampa]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa).toHaveExactUpgradeNames(['shield']);

            expect(context.bossk.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });

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
                context.player1.clickPrompt('Pass');
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

            it('should be able to collect Jabba\'s play discount Bounty a second time', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#hunting-his-prey', deployed: true },
                        hand: ['super-battle-droid']
                    },
                    player2: {
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        groundArena: ['clone-trooper'],
                        hasInitiative: true,
                        resources: 6
                    },
                });

                const { context } = contextRef;

                // apply Jabba bounty to player2's own unit (Clone Trooper)
                context.player2.clickCard(context.jabbaTheHutt);
                context.player2.clickCard(context.cloneTrooper);

                // trigger bounty with Bossk attack
                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.cloneTrooper);

                // trigger the bounty twice
                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: The next unit you play this phase costs 1 resource less');
                context.player1.clickPrompt('Collect Bounty: The next unit you play this phase costs 1 resource less');
                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');

                // play a 3-cost unit with a 2-cost discount
                context.player2.passAction();
                context.player1.clickCard(context.superBattleDroid);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('Bossk\'s leader deployed ability,', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#hunting-his-prey', deployed: true }
                    },
                    player2: {
                        groundArena: [{ card: 'clone-deserter', upgrades: ['guild-target'] }]
                    },
                });
            });

            it('when a unit has two bounties on it, can double trigger the first bounty and will then not be available for the second', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.cloneDeserter);

                expect(context.player1).toHaveExactPromptButtons([
                    'Collect Bounty: Draw a card',
                    'Collect Bounty: Deal 2 damage to a base. If the Bounty unit is unique, deal 3 damage instead'
                ]);

                context.player1.clickPrompt('Collect Bounty: Deal 2 damage to a base. If the Bounty unit is unique, deal 3 damage instead');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);

                // resolve the Clone Deserter bounty, Bossk ability is already used and can't trigger
                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player1.clickPrompt('Collect Bounty: Draw a card');
                expect(context.player1.handSize).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });

            it('when a unit has two bounties on it, can pass on double triggering the first bounty and will then double trigger the second', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.cloneDeserter);

                expect(context.player1).toHaveExactPromptButtons([
                    'Collect Bounty: Draw a card',
                    'Collect Bounty: Deal 2 damage to a base. If the Bounty unit is unique, deal 3 damage instead'
                ]);

                context.player1.clickPrompt('Collect Bounty: Deal 2 damage to a base. If the Bounty unit is unique, deal 3 damage instead');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Pass');

                // resolve the Clone Deserter bounty, Bossk ability is already used and can't trigger
                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player1.clickPrompt('Collect Bounty: Draw a card');
                expect(context.player1.handSize).toBe(1);

                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1.handSize).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Bossk\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#hunting-his-prey', deployed: true },
                        deck: ['atst', 'waylay'],
                        resources: 4
                    },
                    player2: {
                        groundArena: [
                            { card: 'clone-trooper', upgrades: ['price-on-your-head'] },
                            { card: 'battle-droid', upgrades: ['guild-target'] },
                        ]
                    },
                });
            });

            it('should be able to collect a "resource the top card of your deck" ability a second time', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.cloneTrooper);

                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Put the top card of your deck into play as a resource');
                context.player1.clickPrompt('Collect Bounty: Put the top card of your deck into play as a resource');
                expect(context.player1.resources.length).toBe(5);
                expect(context.atst).toBeInZone('resource');

                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1.resources.length).toBe(6);
                expect(context.waylay).toBeInZone('resource');
            });

            it('should be able to collect a "resource the top card of your deck" ability a second time even if the deck is empty', function() {
                const { context } = contextRef;

                context.player1.setDeck([]);

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.cloneTrooper);

                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Put the top card of your deck into play as a resource');
                context.player1.clickPrompt('Collect Bounty: Put the top card of your deck into play as a resource');
                expect(context.player1.resources.length).toBe(4);

                // Bossk ability triggers since we chose to resolve the Bounty (even though the resolution didn't change game state)
                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1.resources.length).toBe(4);

                // trigger a second Bounty to confirm that Bossk's ability limit did trigger and is used up for the phase
                context.player2.clickCard(context.battleDroid);
                context.player2.clickCard(context.bossk);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);

                expect(context.player1).toBeActivePlayer();
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
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.battlefieldMarine, context.snowtrooperLieutenant, context.sabineWren],
                    invalid: [context.waylay, context.protector]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect([context.sabineWren, context.waylay, context.snowtrooperLieutenant, context.protector]).toAllBeInBottomOfDeck(context.player1, 4);

                // second Bounty trigger, play a unit that has a "when played" which triggers an attack
                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.infernoFour, context.sabineWren, context.snowtrooperLieutenant],
                    invalid: [context.waylay, context.protector]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.snowtrooperLieutenant);
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

            it('should be able to collect a nested bounty a second time, and lose the ability to resolve the original bounty a second time', function() {
                const { context } = contextRef;
                const prompt = 'Collect Bounty: Search the top 5 cards of your deck, or 10 cards instead if this unit is unique, for a unit that costs 3 or less and play it for free.';

                // first Bounty trigger: Bounty Hunter's Quarry, play a unit that has a "when played" which triggers an attack
                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.cloneTrooper);
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.battlefieldMarine, context.snowtrooperLieutenant, context.sabineWren],
                    invalid: [context.waylay, context.protector]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.snowtrooperLieutenant);
                expect(context.snowtrooperLieutenant).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(0);

                // TODO: need final confirmation from judges / FFG on whether these go in the same trigger window or if there's nesting happening
                expect(context.player1).toHaveExactPromptButtons(['Collect the Bounty again', 'Attack with a unit']);

                // do the attack, trigger _another_ bounty
                context.player1.clickPrompt('Attack with a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.cloneDeserter);

                // resolve the Clone Deserter bounty
                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player1.clickPrompt('Collect Bounty: Draw a card');
                expect(context.player1.handSize).toBe(1);

                // activate Bossk ability here to re-collect the Clone Deserter bounty, using up the per-round limit so we can't activate BHQ's Bounty again
                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1.handSize).toBe(2);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
