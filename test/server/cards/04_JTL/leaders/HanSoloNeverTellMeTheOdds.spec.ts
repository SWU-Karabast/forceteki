
describe('Han Solo, Never Tell Me the Odds', function() {
    integration(function(contextRef) {
        describe('Han Solo, Never Tell Me the Odds\'s undeployed ability', function() {
            it('should reveal a 1-cost card from the top of his deck and attack with a 3-cost unit with +1/+0 for the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        deck: ['daring-raid'],
                        groundArena: ['echo-base-defender']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Reveal the top card of your deck');
                expect(context.getChatLogs(1)[0]).toContain(context.daringRaid.title);

                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.daringRaid]);
                context.player1.clickDone();

                expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender]);
                expect(context.hanSolo.exhausted).toBeTrue();

                context.player1.clickCard(context.echoBaseDefender);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
            });

            it('should not give +1/+0 when the revealed card is the same odd cost as the attacker', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        deck: ['hello-there'],
                        groundArena: ['echo-base-defender']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Reveal the top card of your deck');
                expect(context.getChatLogs(1)[0]).toContain(context.helloThere.title);
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.helloThere]);
                context.player1.clickDone();

                expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender]);
                expect(context.hanSolo.exhausted).toBeTrue();

                context.player1.clickCard(context.echoBaseDefender);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should not give +1/+0 when the revealed card is a different even cost than the attacker', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        deck: ['surprise-strike'],
                        groundArena: ['modded-cohort']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Reveal the top card of your deck');
                expect(context.getChatLogs(1)[0]).toContain(context.surpriseStrike.title);
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.surpriseStrike]);
                context.player1.clickDone();

                expect(context.player1).toBeAbleToSelectExactly([context.moddedCohort]);
                expect(context.hanSolo.exhausted).toBeTrue();
                context.player1.clickCard(context.moddedCohort);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should only reveal a card if there are no friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        deck: ['hello-there']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Reveal the top card of your deck');
                expect(context.getChatLogs(1)[0]).toContain(context.helloThere.title);
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.helloThere]);
                context.player1.clickDone();

                expect(context.hanSolo.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should only attack if there are no cards in the deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        groundArena: ['echo-base-defender'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Reveal the top card of your deck');
                expect(context.getChatLogs(1)[0]).toContain('player1 uses Han Solo');
                expect(context.getChatLogs(1)[0]).not.toContain('reveal');

                expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender]);
                expect(context.hanSolo.exhausted).toBeTrue();
                context.player1.clickCard(context.echoBaseDefender);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Han Solo, Never Tell Me the Odds\'s When Deployed ability', function() {
            it('does nothing if deployed as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        hand: ['republic-attack-pod'],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                // Spend all 6 resources
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.readyResourceCount).toBe(0);
                context.player2.passAction();

                // Attach Han Solo to a unit
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Reveal the top card of your deck', 'Deploy Han Solo', 'Deploy Han Solo as a Pilot']);
                context.player1.clickPrompt('Deploy Han Solo');
                expect(context.hanSolo.getPower()).toBe(3);
                expect(context.hanSolo.getHp()).toBe(7);
                expect(context.player1.readyResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('can attach as a pilot leader and give proper resource boost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        hand: ['republic-attack-pod'],
                        spaceArena: ['concord-dawn-interceptors'],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                // Spend all 6 resources
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.readyResourceCount).toBe(0);
                context.player2.passAction();

                // Attach Han Solo to a unit
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Reveal the top card of your deck', 'Deploy Han Solo', 'Deploy Han Solo as a Pilot']);
                context.player1.clickPrompt('Deploy Han Solo as a Pilot');
                expect(context.player2).not.toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.concordDawnInterceptors, context.republicAttackPod]);
                context.player1.clickCard(context.concordDawnInterceptors);
                expect(context.concordDawnInterceptors.getPower()).toBe(4);
                expect(context.concordDawnInterceptors.getHp()).toBe(8);
            });

            it('will ready resources equal to the number of odds units and upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        hand: ['republic-attack-pod'],
                        spaceArena: [{ card: 'concord-dawn-interceptors', upgrades: ['snapshot-reflexes'] }],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                // Spend all 6 resources
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.readyResourceCount).toBe(0);
                context.player2.passAction();

                // Attach Han Solo to a unit
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Reveal the top card of your deck', 'Deploy Han Solo', 'Deploy Han Solo as a Pilot']);
                context.player1.clickPrompt('Deploy Han Solo as a Pilot');
                expect(context.player2).not.toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectExactly([context.concordDawnInterceptors, context.republicAttackPod]);
                context.player1.clickCard(context.concordDawnInterceptors);

                // Han should ready 4 resources
                expect(context.player1.readyResourceCount).toBe(3);
            });

            it('does not count friendly even-costed units or upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        hand: ['republic-attack-pod'],
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing'],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                // Spend all 6 resources
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.readyResourceCount).toBe(0);
                context.player2.passAction();

                // Attach Han Solo to a unit
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Reveal the top card of your deck', 'Deploy Han Solo', 'Deploy Han Solo as a Pilot']);
                context.player1.clickPrompt('Deploy Han Solo as a Pilot');
                context.player1.clickCard(context.republicAttackPod);

                // Han should ready 1 reesource - for just himself
                expect(context.player1.readyResourceCount).toBe(1);
            });

            it('does not count enemy odd-costed units or upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#never-tell-me-the-odds',
                        hand: ['republic-attack-pod'],
                        resources: 6
                    },
                    player2: {
                        spaceArena: ['concord-dawn-interceptors'],
                        groundArena: [{ card: 'moisture-farmer', upgrades: ['snapshot-reflexes'] }]
                    }
                });

                const { context } = contextRef;

                // Spend all 6 resources
                context.player1.clickCard(context.republicAttackPod);
                expect(context.player1.readyResourceCount).toBe(0);
                context.player2.passAction();

                // Attach Han Solo to a unit
                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toHaveExactPromptButtons(['Cancel', 'Reveal the top card of your deck', 'Deploy Han Solo', 'Deploy Han Solo as a Pilot']);
                context.player1.clickPrompt('Deploy Han Solo as a Pilot');
                context.player1.clickCard(context.republicAttackPod);

                // Han should ready 1 reesource - for just himself
                expect(context.player1.readyResourceCount).toBe(1);
            });
        });
    });
});