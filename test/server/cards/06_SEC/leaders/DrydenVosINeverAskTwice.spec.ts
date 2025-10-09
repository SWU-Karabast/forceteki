describe('Dryden Vos, I Never Ask Twice', function () {
    integration(function (contextRef) {
        const undeployedPrompt = 'Play a unit that costs 5 or less from your hand. It gains Ambush for this phase.';
        const deployedPrompt = 'Play a unit from your hand. It gains Ambush for this phase.';

        it('Dryden Vos\'s undeployed ability must exhaust himself and discard a card which costs 6 or more to play a unit from hand which costs 5 or less and give it Ambush', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'dryden-vos#i-never-ask-twice',
                    hand: ['wampa', 'rukh#thrawns-assassin', 'atst', 'avenger#hunting-star-destroyer'],
                    base: 'shadow-collective-camp'
                },
                player2: {
                    groundArena: ['consular-security-force']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);

            // choose a card to discard
            context.player1.clickPrompt(undeployedPrompt);
            expect(context.player1).toHavePrompt('Choose a card to discard');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.avenger]);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.avenger);

            // choose a unit to play with ambush
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rukh]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            // trigger or pass ambush
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            // choose which unit to attack
            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);

            expect(context.wampa.damage).toBe(3);
            expect(context.consularSecurityForce.damage).toBe(4);

            expect(context.avenger).toBeInZone('discard', context.player1);
            expect(context.drydenVos.exhausted).toBeTrue();
        });

        it('Dryden Vos\'s undeployed ability must exhaust himself and discard a card which costs 6 or more to play a unit from hand which costs 5 or less and give it Ambush (no enough resources for some playable cards)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'dryden-vos#i-never-ask-twice',
                    hand: ['wampa', 'rukh#thrawns-assassin', 'atst', 'avenger#hunting-star-destroyer'],
                    base: 'shadow-collective-camp',
                    resources: 4
                },
                player2: {
                    groundArena: ['consular-security-force']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);

            // choose a card to discard
            expect(context.player1).toHavePrompt('Choose a card to discard');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.avenger]);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.avenger);

            // choose a unit to play with ambush
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            // trigger or pass ambush
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            // choose which unit to attack
            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);

            expect(context.wampa.damage).toBe(3);
            expect(context.consularSecurityForce.damage).toBe(4);

            expect(context.avenger).toBeInZone('discard', context.player1);
            expect(context.drydenVos.exhausted).toBeTrue();
        });

        it('Dryden Vos\'s undeployed ability must exhaust himself and discard a card which costs 6 or more to play a unit from hand which costs 5 or less and give it Ambush (no enough resources for all playable cards)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'dryden-vos#i-never-ask-twice',
                    hand: ['wampa', 'rukh#thrawns-assassin', 'atst', 'avenger#hunting-star-destroyer'],
                    base: 'shadow-collective-camp',
                    resources: 3
                },
                player2: {
                    groundArena: ['consular-security-force']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);

            // choose a card to discard
            expect(context.player1).toHavePrompt('Choose a card to discard');
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.avenger]);
            expect(context.player1).toHaveEnabledPromptButton('Cancel');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.avenger);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('hand', context.player1);
            expect(context.rukh).toBeInZone('hand', context.player1);
            expect(context.atst).toBeInZone('hand', context.player1);
            expect(context.avenger).toBeInZone('discard', context.player1);
            expect(context.drydenVos.exhausted).toBeTrue();
        });

        it('Dryden Vos\'s undeployed ability must exhaust himself and discard a card which costs 6 or more to play a unit from hand which costs 5 or less and give it Ambush (nothing to Ambush)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'dryden-vos#i-never-ask-twice',
                    hand: ['wampa', 'rukh#thrawns-assassin', 'atst', 'avenger#hunting-star-destroyer', 'endless-legions']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);

            // choose a card to discard
            context.player1.clickPrompt(undeployedPrompt);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.avenger, context.endlessLegions]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.avenger);

            // choose a unit to play with ambush
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rukh]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.avenger).toBeInZone('discard', context.player1);
            expect(context.drydenVos.exhausted).toBeTrue();
        });

        it('Dryden Vos\'s undeployed ability should does nothing if there is no cards which costs 6 or more to discard', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'dryden-vos#i-never-ask-twice',
                    hand: ['wampa', 'rukh#thrawns-assassin'],
                    resources: 6
                },
                player2: {
                    groundArena: ['yoda#old-master']
                }
            });

            const { context } = contextRef;

            expect(context.player1).toBeActivePlayer();
            expect(context.drydenVos).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('Dryden Vos\'s deployed ability must discard a card from hand to play a unit from hand and give it Ambush (no limit per turn)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'dryden-vos#i-never-ask-twice', deployed: true },
                    hand: ['wampa', 'rukh#thrawns-assassin', 'yoda#old-master', 'avenger#hunting-star-destroyer', 'endless-legions'],
                    base: 'shadow-collective-camp'
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            expect(context.player1).toHaveEnabledPromptButton(deployedPrompt);
            context.player1.clickPrompt(deployedPrompt);

            // choose a card to discard
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rukh, context.yoda, context.avenger, context.endlessLegions]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.yoda);

            // choose a unit to play
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rukh, context.avenger]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            // trigger or pass ambush
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            // choose which unit to attack
            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);

            expect(context.wampa.damage).toBe(3);
            expect(context.consularSecurityForce.damage).toBe(4);

            expect(context.yoda).toBeInZone('discard', context.player1);
            expect(context.drydenVos.exhausted).toBeFalse();

            context.player2.passAction();

            context.player1.clickCard(context.drydenVos);
            context.player1.clickPrompt(deployedPrompt);

            context.player1.clickCard(context.endlessLegions);
            context.player1.clickCard(context.rukh);

            context.player1.clickPrompt('Ambush'); // must choose between ambush & shield
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(9);

            expect(context.endlessLegions).toBeInZone('discard', context.player1);
            expect(context.rukh).toBeInZone('groundArena', context.player1);
            expect(context.drydenVos.exhausted).toBeFalse();
        });

        it('Dryden Vos\'s deployed ability must discard a card from hand to play a unit from hand and give it Ambush (nothing to Ambush)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'dryden-vos#i-never-ask-twice', deployed: true },
                    hand: ['wampa', 'rukh#thrawns-assassin', 'yoda#old-master', 'avenger#hunting-star-destroyer', 'endless-legions'],
                    base: 'shadow-collective-camp'
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            expect(context.player1).toHaveEnabledPromptButton(deployedPrompt);
            context.player1.clickPrompt(deployedPrompt);

            // choose a card to discard
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rukh, context.yoda, context.avenger, context.endlessLegions]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.yoda);

            // choose a unit to play
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rukh, context.avenger]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            // nothing to ambush
            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);

            expect(context.wampa).toBeInZone('groundArena', context.player1);
            expect(context.yoda).toBeInZone('discard', context.player1);
            expect(context.drydenVos.exhausted).toBeFalse();
        });

        it('Dryden Vos\'s deployed ability must discard a card from hand to play a unit from hand and give it Ambush (only 1 card to discard)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'dryden-vos#i-never-ask-twice', deployed: true },
                    hand: ['wampa'],
                    base: 'shadow-collective-camp'
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drydenVos);
            expect(context.player1).toHaveEnabledPromptButton(deployedPrompt);
            context.player1.clickPrompt(deployedPrompt);

            // choose a card to discard
            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            // no more unit to play
            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard', context.player1);
        });

        it('Dryden Vos\'s deployed ability must discard a card from hand to play a unit from hand and give it Ambush (can be used while exhausted)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'dryden-vos#i-never-ask-twice', deployed: true },
                    hand: ['wampa', 'rukh#thrawns-assassin', 'yoda#old-master', 'avenger#hunting-star-destroyer', 'endless-legions'],
                    base: 'shadow-collective-camp'
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            // attack with dryden vos to exhaust him
            context.player1.clickCard(context.drydenVos);
            context.player1.clickPrompt('Attack');
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            context.player1.clickCard(context.drydenVos);

            // choose a card to discard
            expect(context.player1).toHavePrompt('Choose a card to discard');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rukh, context.yoda, context.avenger, context.endlessLegions]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.yoda);

            // choose a unit to play
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.rukh, context.avenger]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            // trigger or pass ambush
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            // choose which unit to attack
            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(4);

            expect(context.wampa.damage).toBe(3);
            expect(context.consularSecurityForce.damage).toBe(4);

            expect(context.yoda).toBeInZone('discard', context.player1);
        });

        it('Dryden Vos\'s deployed ability should does nothing if hand is empty', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'dryden-vos#i-never-ask-twice', deployed: true, exhausted: true },
                },
                player2: {
                    groundArena: ['yoda#old-master']
                }
            });

            const { context } = contextRef;

            expect(context.player1).toBeActivePlayer();
            expect(context.drydenVos).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });
    });
});
