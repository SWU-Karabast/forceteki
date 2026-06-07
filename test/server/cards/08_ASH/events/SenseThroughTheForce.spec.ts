describe('Sense Through The Force', function() {
    integration(function(contextRef) {
        describe('Sense Through The Force\'s Ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sense-through-the-force'],
                        groundArena: ['gungi#finding-himself', 'rebel-pathfinder'],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                        deck: ['cell-block-guard', 'pyke-sentinel', 'volunteer-soldier', 'cartel-spacer', 'battlefield-marine', 'wampa', 'viper-probe-droid', 'snowtrooper-lieutenant'],
                    },
                    player2: {
                        groundArena: ['trayus-acolyte'],
                        leader: { card: 'darth-vader#victor-squadron-leader', deployed: true }
                    }
                });
            });

            it('should prompt to choose a number, search the top 5 cards, reveal one, draw it, give 3 Advantage to a friendly force unit and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.senseThroughTheForce);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('2');
                expect(context.getChatLogs(3)).toContain('player1 names 2 using Sense Through the Force');

                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [],
                    selectable: [context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Choose Battlefield Marine
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                context.player2.clickDone();

                expect(context.getChatLog()).toContain('player1 uses Sense Through the Force to reveal and draw Battlefield Marine');
                expect(context.battlefieldMarine).toBeInZone('hand');

                // Ensure that cards have moved to bottom of deck
                expect(context.cartelSpacer).toBeInBottomOfDeck(context.player1, 4);
                expect(context.cellBlockGuard).toBeInBottomOfDeck(context.player1, 4);
                expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 4);
                expect(context.volunteerSoldier).toBeInBottomOfDeck(context.player1, 4);

                expect(context.player1).toHavePrompt('Give 3 Advantage tokens to a Force unit');
                expect(context.player1).toBeAbleToSelectExactly([context.gungi, context.grandInquisitor, context.trayusAcolyte, context.darthVader]);
                context.player1.clickCard(context.gungi);

                expect(context.gungi).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            });

            it('should prompt to choose a number, search the top 5 cards, reveal one, draw it, give 3 Advantage to a friendly force leader unit and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.senseThroughTheForce);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('2');
                expect(context.getChatLogs(3)).toContain('player1 names 2 using Sense Through the Force');

                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [],
                    selectable: [context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Choose Battlefield Marine
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                context.player2.clickDone();

                expect(context.getChatLog()).toContain('player1 uses Sense Through the Force to reveal and draw Battlefield Marine');
                expect(context.battlefieldMarine).toBeInZone('hand');

                // Ensure that cards have moved to bottom of deck
                expect(context.cartelSpacer).toBeInBottomOfDeck(context.player1, 4);
                expect(context.cellBlockGuard).toBeInBottomOfDeck(context.player1, 4);
                expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 4);
                expect(context.volunteerSoldier).toBeInBottomOfDeck(context.player1, 4);

                expect(context.player1).toHavePrompt('Give 3 Advantage tokens to a Force unit');
                expect(context.player1).toBeAbleToSelectExactly([context.gungi, context.grandInquisitor, context.trayusAcolyte, context.darthVader]);
                context.player1.clickCard(context.grandInquisitor);

                expect(context.grandInquisitor).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            });

            it('should prompt to choose a number, search the top 5 cards, reveal one, draw it, give 3 Advantage to an enemy force unit and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.senseThroughTheForce);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('2');
                expect(context.getChatLogs(3)).toContain('player1 names 2 using Sense Through the Force');

                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [],
                    selectable: [context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Choose Battlefield Marine
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                context.player2.clickDone();

                expect(context.getChatLog()).toContain('player1 uses Sense Through the Force to reveal and draw Battlefield Marine');
                expect(context.battlefieldMarine).toBeInZone('hand');

                // Ensure that cards have moved to bottom of deck
                expect(context.cartelSpacer).toBeInBottomOfDeck(context.player1, 4);
                expect(context.cellBlockGuard).toBeInBottomOfDeck(context.player1, 4);
                expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 4);
                expect(context.volunteerSoldier).toBeInBottomOfDeck(context.player1, 4);

                expect(context.player1).toHavePrompt('Give 3 Advantage tokens to a Force unit');
                expect(context.player1).toBeAbleToSelectExactly([context.gungi, context.grandInquisitor, context.trayusAcolyte, context.darthVader]);
                context.player1.clickCard(context.trayusAcolyte);

                expect(context.trayusAcolyte).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            });

            it('should prompt to choose a number, search the top 5 cards, reveal one, draw it, give 3 Advantage to an enemy force leader unit and move the rest to the bottom of the deck', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.senseThroughTheForce);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('2');
                expect(context.getChatLogs(3)).toContain('player1 names 2 using Sense Through the Force');

                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [],
                    selectable: [context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Choose Battlefield Marine
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                context.player2.clickDone();

                expect(context.getChatLog()).toContain('player1 uses Sense Through the Force to reveal and draw Battlefield Marine');
                expect(context.battlefieldMarine).toBeInZone('hand');

                // Ensure that cards have moved to bottom of deck
                expect(context.cartelSpacer).toBeInBottomOfDeck(context.player1, 4);
                expect(context.cellBlockGuard).toBeInBottomOfDeck(context.player1, 4);
                expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 4);
                expect(context.volunteerSoldier).toBeInBottomOfDeck(context.player1, 4);

                expect(context.player1).toHavePrompt('Give 3 Advantage tokens to a Force unit');
                expect(context.player1).toBeAbleToSelectExactly([context.gungi, context.grandInquisitor, context.trayusAcolyte, context.darthVader]);
                context.player1.clickCard(context.darthVader);

                expect(context.darthVader).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            });

            it('should prompt to choose a number, search the top 5 cards, reveal one, draw it, but not give Advantage if cost does not match', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.senseThroughTheForce);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('4');
                expect(context.getChatLogs(3)).toContain('player1 names 4 using Sense Through the Force');

                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [],
                    selectable: [context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Choose Battlefield Marine
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                context.player2.clickDone();

                expect(context.getChatLog()).toContain('player1 uses Sense Through the Force to reveal and draw Battlefield Marine');
                expect(context.battlefieldMarine).toBeInZone('hand');

                // Ensure that cards have moved to bottom of deck
                expect(context.cartelSpacer).toBeInBottomOfDeck(context.player1, 4);
                expect(context.cellBlockGuard).toBeInBottomOfDeck(context.player1, 4);
                expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 4);
                expect(context.volunteerSoldier).toBeInBottomOfDeck(context.player1, 4);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be allowed to choose nothing and place all cards on the bottom of the deck', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.senseThroughTheForce);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('4');
                expect(context.getChatLogs(3)).toContain('player1 names 4 using Sense Through the Force');
                context.player1.clickPrompt('Take nothing');

                // Ensure that cards have moved to bottom of deck
                expect([context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier]).toAllBeInBottomOfDeck(context.player1, 5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow selection when deck has less than five cards', function() {
                const { context } = contextRef;

                context.player1.setDeck([context.battlefieldMarine, context.cellBlockGuard, context.cartelSpacer]);
                context.player1.clickCard(context.senseThroughTheForce);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('2');
                expect(context.getChatLogs(3)).toContain('player1 names 2 using Sense Through the Force');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard],
                    invalid: [],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                context.player2.clickDone();

                // Ensure that cards have moved to bottom of deck
                expect(context.player1.deck.length).toBe(2);
                expect([context.cartelSpacer, context.cellBlockGuard]).toAllBeInBottomOfDeck(context.player1, 2);

                expect(context.player1).toHavePrompt('Give 3 Advantage tokens to a Force unit');
                expect(context.player1).toBeAbleToSelectExactly([context.gungi, context.grandInquisitor, context.trayusAcolyte, context.darthVader]);
                context.player1.clickCard(context.darthVader);

                expect(context.darthVader).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage']);
            });

            it('when the deck is empty', function() {
                const { context } = contextRef;

                context.player1.setDeck([]);
                expect(context.player1.deck.length).toBe(0);

                // Check results
                context.player1.clickCard(context.senseThroughTheForce);
                context.player1.clickPrompt('Play anyway');

                // Player 2 now active
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Mon Mothma\'s Ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sense-through-the-force'],
                        groundArena: ['rebel-pathfinder'],
                        deck: ['cell-block-guard', 'pyke-sentinel', 'volunteer-soldier', 'cartel-spacer', 'battlefield-marine', 'wampa', 'viper-probe-droid', 'snowtrooper-lieutenant'],
                    }
                });
            });

            it('no cards matching criteria', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.senseThroughTheForce);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('4');
                expect(context.getChatLogs(3)).toContain('player1 names 4 using Sense Through the Force');

                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [],
                    selectable: [context.battlefieldMarine, context.cartelSpacer, context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Choose Battlefield Marine
                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);

                // P2 is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine]);
                context.player2.clickDone();

                expect(context.getChatLog()).toContain('player1 uses Sense Through the Force to reveal and draw Battlefield Marine and to move 4 cards to the bottom of their deck');
                expect(context.battlefieldMarine).toBeInZone('hand');

                // Ensure that cards have moved to bottom of deck
                expect(context.cartelSpacer).toBeInBottomOfDeck(context.player1, 4);
                expect(context.cellBlockGuard).toBeInBottomOfDeck(context.player1, 4);
                expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 4);
                expect(context.volunteerSoldier).toBeInBottomOfDeck(context.player1, 4);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});