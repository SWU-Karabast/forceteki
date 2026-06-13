describe('Greef Karga, Gracious Magistrate', function() {
    integration(function(contextRef) {
        describe('his leader side ability', function() {
            const abilityTitle = (unitTitle: string) => `Exhaust Greef Karga to give an Advantage token to ${unitTitle}`;

            describe('when the player plays a unit', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'greef-karga#gracious-magistrate',
                            hand: ['battlefield-marine', 'porg']
                        },
                        player2: {
                            hand: ['pyke-sentinel']
                        }
                    });
                });

                it('should exhaust Greef and give an Advantage token to the played unit when the prompt is accepted', function() {
                    const { context } = contextRef;

                    // Play a unit; Greef's optional trigger fires
                    context.player1.clickCard(context.battlefieldMarine);

                    expect(context.player1).toHavePassAbilityPrompt(abilityTitle(context.battlefieldMarine.title));
                    context.player1.clickPrompt('Trigger');

                    // Greef exhausts and the unit receives an Advantage token
                    expect(context.greefKarga.exhausted).toBeTrue();
                    expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not exhaust Greef and should not give an Advantage token when the prompt is declined', function() {
                    const { context } = contextRef;

                    // Play a unit; Greef's optional trigger fires
                    context.player1.clickCard(context.battlefieldMarine);

                    expect(context.player1).toHavePassAbilityPrompt(abilityTitle(context.battlefieldMarine.title));
                    context.player1.clickPrompt('Pass');

                    // Greef is untouched and the unit has no upgrade
                    expect(context.greefKarga.exhausted).toBeFalse();
                    expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not present the prompt when Greef is already exhausted', function() {
                    const { context } = contextRef;

                    // Exhaust Greef by triggering on the first unit
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.player1).toHavePassAbilityPrompt(abilityTitle(context.battlefieldMarine.title));
                    context.player1.clickPrompt('Trigger');
                    expect(context.greefKarga.exhausted).toBeTrue();

                    context.player2.passAction();

                    // Play a second unit — no prompt because Greef is exhausted
                    context.player1.clickCard(context.porg);
                    expect(context.player1).not.toHavePassAbilityPrompt(abilityTitle(context.porg.title));
                    expect(context.porg).toHaveExactUpgradeNames([]);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not trigger when the enemy player plays a unit', function() {
                    const { context } = contextRef;

                    // P2 plays a unit; Greef does not trigger for the opposing player
                    context.player1.passAction();
                    context.player2.clickCard(context.pykeSentinel);

                    expect(context.greefKarga.exhausted).toBeFalse();
                    expect(context.pykeSentinel).toHaveExactUpgradeNames([]);
                    expect(context.player1).toBeActivePlayer();
                });
            });

            it('should not trigger when the player plays an upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'greef-karga#gracious-magistrate',
                        hand: ['resilient'],
                        groundArena: ['battlefield-marine'],
                        resources: 10
                    }
                });

                const { context } = contextRef;

                // Play an upgrade on a friendly unit
                context.player1.clickCard(context.resilient);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['resilient']);

                // Greef does not trigger, it is Player 2's action
                expect(context.greefKarga.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when the player plays a Piloting unit as an upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'greef-karga#gracious-magistrate',
                        hand: ['independent-smuggler'],
                        spaceArena: ['n1-starfighter'],
                    }
                });

                const { context } = contextRef;

                // Play a Piloting unit as an upgrade on a friendly unit
                context.player1.clickCard(context.independentSmuggler);
                context.player1.clickPrompt('Play Independent Smuggler with Piloting');
                context.player1.clickCard(context.n1Starfighter);
                expect(context.n1Starfighter).toHaveExactUpgradeNames(['independent-smuggler']);

                // Greef does not trigger, it is Player 2's action
                expect(context.greefKarga.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger on token creation and give one token an Advantage token when accepted', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'greef-karga#gracious-magistrate',
                        hand: ['dedicated-wingmen'], // creates 2 X-Wing tokens
                    }
                });

                const { context } = contextRef;

                // Play an event that creates 2 tokens — Greef triggers once per token entering play
                context.player1.clickCard(context.dedicatedWingmen);

                // Both tokens trigger simultaneously — ordering prompt appears first
                context.player1.clickPrompt(`${abilityTitle('X-Wing')}`);

                // Accept the trigger for the first X-Wing
                expect(context.player1).toHavePassAbilityPrompt(`${abilityTitle('X-Wing')}: X-Wing`);
                context.player1.clickPrompt('Trigger');
                expect(context.greefKarga.exhausted).toBeTrue();

                // Second X-Wing trigger: Greef is already exhausted, prompt does not appear
                expect(context.player1).not.toHavePassAbilityPrompt(abilityTitle('X-Wing'));

                // Exactly one X-Wing has an Advantage token
                const xwings = context.player1.findCardsByName('xwing');
                expect(xwings.length).toBe(2);
                const xwingsWithAdvantage = xwings.filter((xwing) => xwing.upgrades.length > 0);
                const xwingsWithout = xwings.filter((xwing) => xwing.upgrades.length === 0);
                expect(xwingsWithAdvantage.length).toBe(1);
                expect(xwingsWithout.length).toBe(1);
                expect(xwingsWithAdvantage[0]).toHaveExactUpgradeNames(['advantage']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when Greef himself is deployed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'greef-karga#gracious-magistrate',
                        resources: 6
                    }
                });

                const { context } = contextRef;

                // Deploy Greef via Epic Action — deploying is not playing or creating a unit
                context.player1.clickCard(context.greefKarga);
                context.player1.clickPrompt('Deploy Greef Karga');

                expect(context.greefKarga).toBeInZone('groundArena');
                expect(context.greefKarga).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('his leader unit side ability', function() {
            const abilityTitle = (unitTitle: string) => `Give an Advantage token to ${unitTitle}`;

            describe('when the player plays a unit', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: { card: 'greef-karga#gracious-magistrate', deployed: true },
                            hand: ['battlefield-marine', 'porg']
                        },
                        player2: {
                            hand: ['pyke-sentinel']
                        }
                    });
                });

                it('should automatically give an Advantage token to the played unit without exhausting Greef', function() {
                    const { context } = contextRef;

                    // Play a unit — mandatory trigger, no prompt to decline
                    context.player1.clickCard(context.battlefieldMarine);

                    expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);
                    expect(context.greefKarga.exhausted).toBeFalse();
                    expect(context.player2).toBeActivePlayer();
                });

                it('should give an Advantage token to each subsequent unit played in the same phase', function() {
                    const { context } = contextRef;

                    // First unit played this phase
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);

                    context.player2.passAction();

                    // Second unit played this phase — Greef triggers again
                    context.player1.clickCard(context.porg);
                    expect(context.porg).toHaveExactUpgradeNames(['advantage']);
                    expect(context.player2).toBeActivePlayer();
                });

                it('should not trigger when the enemy player plays a unit', function() {
                    const { context } = contextRef;

                    // P2 plays a unit; Greef does not trigger for the opposing player
                    context.player1.passAction();
                    context.player2.clickCard(context.pykeSentinel);

                    expect(context.pykeSentinel).toHaveExactUpgradeNames([]);
                    expect(context.player1).toBeActivePlayer();
                });
            });

            it('should not trigger when the player plays an upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'greef-karga#gracious-magistrate', deployed: true },
                        hand: ['preparation'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play an upgrade on a friendly unit
                context.player1.clickCard(context.preparation);
                context.player1.clickCard(context.battlefieldMarine);

                // Greef does not trigger; Battlefield Marine only has the Preparation upgrade
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['preparation']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should automatically give an Advantage token to each created token unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'greef-karga#gracious-magistrate', deployed: true },
                        hand: ['dedicated-wingmen'], // creates 2 X-Wing tokens
                    }
                });

                const { context } = contextRef;

                // Play an event that creates 2 tokens — ordering prompt appears since both trigger simultaneously
                context.player1.clickCard(context.dedicatedWingmen);
                context.player1.clickPrompt(`${abilityTitle('X-Wing')}`);

                // Both X-Wing tokens receive an Advantage token automatically (no exhaust cost)
                const xwings = context.player1.findCardsByName('xwing');
                expect(xwings.length).toBe(2);
                xwings.forEach((xwing) => expect(xwing).toHaveExactUpgradeNames(['advantage']));
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
