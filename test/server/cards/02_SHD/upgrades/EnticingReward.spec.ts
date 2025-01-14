describe('Enticing Reward', function () {
    integration(function (contextRef) {
        describe('Enticing reward bounty\'s ability', function () {
            const prompt = 'Collect Bounty: Search the top 10 cards of your deck for 2 non-unit cards, reveal them, and draw them.';

            it('should prompt to choose up to 2 non-units from the top 10 cards, reveal them, draw them, and move the rest to the bottom of the deck and discard a card from hand because attached unit is not unique', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['scout-bike-pursuer', 'atst'],
                        groundArena: ['wampa'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'protector', 'inferno-four#unforgetting', 'devotion', 'consular-security-force', 'echo-base-defender', 'swoop-racer', 'resupply', 'superlaser-technician'],
                    },
                    player2: {
                        groundArena: [{ card: 'specforce-soldier', upgrades: ['enticing-reward'] }]
                    }
                });

                const { context } = contextRef;

                // kill bountied unit
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);

                // use bounty
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);

                // choose up to 2 non-units cards
                expect(context.player1).toHaveExactDisplayPromptCards({
                    unselectable: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.swoopRacer],
                    selectable: [context.waylay, context.protector, context.devotion, context.resupply]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.devotion);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.devotion],
                    unselectable: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.swoopRacer],
                    selectable: [context.waylay, context.protector, context.resupply]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.waylay);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.devotion, context.waylay],
                    unselectable: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.swoopRacer],
                    selectable: [context.protector, context.resupply]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // one click to confirm that additional cards can't be selected
                context.player1.clickCardInDisplayCardPrompt(context.protector, true);

                context.player1.clickPrompt('Done');
                expect(context.getChatLogs(2)).toContain('player1 takes Waylay and Devotion');
                expect(context.waylay).toBeInZone('hand');
                expect(context.devotion).toBeInZone('hand');

                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 8);
                expect(context.sabineWren).toBeInBottomOfDeck(context.player1, 8);
                expect(context.protector).toBeInBottomOfDeck(context.player1, 8);
                expect(context.resupply).toBeInBottomOfDeck(context.player1, 8);
                expect(context.swoopRacer).toBeInBottomOfDeck(context.player1, 8);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 8);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 8);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 8);

                // must discard a card from hand
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.scoutBikePursuer, context.devotion, context.waylay]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNoTargetButton();

                context.player1.clickCard(context.waylay);
                expect(context.waylay).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should prompt to choose up to 2 non-units from the top 10 cards, reveal them, draw them, and move the rest to the bottom of the deck and do not discard because the attached unit is unique', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['scout-bike-pursuer', 'atst'],
                        groundArena: ['wampa'],
                        deck: ['sabine-wren#explosives-artist', 'battlefield-marine', 'waylay', 'protector', 'inferno-four#unforgetting', 'devotion', 'consular-security-force', 'echo-base-defender', 'swoop-racer', 'resupply', 'superlaser-technician'],
                    },
                    player2: {
                        groundArena: [{ card: 'general-tagge#concerned-commander', upgrades: ['enticing-reward'] }]
                    }
                });

                const { context } = contextRef;

                // kill bountied unit
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.generalTagge);

                // use bounty
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt(prompt);

                // choose up to 2 non-units cards
                expect(context.player1).toHaveExactDisplayPromptCards({
                    unselectable: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.swoopRacer],
                    selectable: [context.waylay, context.protector, context.devotion, context.resupply]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                context.player1.clickCardInDisplayCardPrompt(context.devotion);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.devotion],
                    unselectable: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.swoopRacer],
                    selectable: [context.waylay, context.protector, context.resupply]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickCardInDisplayCardPrompt(context.waylay);
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selected: [context.devotion, context.waylay],
                    unselectable: [context.battlefieldMarine, context.infernoFour, context.consularSecurityForce, context.echoBaseDefender, context.sabineWren, context.swoopRacer],
                    selectable: [context.protector, context.resupply]
                });
                expect(context.player1).toHaveEnabledPromptButton('Done');

                context.player1.clickPrompt('Done');
                expect(context.getChatLogs(2)).toContain('player1 takes Waylay and Devotion');
                expect(context.waylay).toBeInZone('hand');
                expect(context.devotion).toBeInZone('hand');

                expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 8);
                expect(context.sabineWren).toBeInBottomOfDeck(context.player1, 8);
                expect(context.protector).toBeInBottomOfDeck(context.player1, 8);
                expect(context.resupply).toBeInBottomOfDeck(context.player1, 8);
                expect(context.swoopRacer).toBeInBottomOfDeck(context.player1, 8);
                expect(context.infernoFour).toBeInBottomOfDeck(context.player1, 8);
                expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 8);
                expect(context.echoBaseDefender).toBeInBottomOfDeck(context.player1, 8);

                // do not have to discard a card from hand
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
