describe('Emperor Palpatine, Galactic Ruler', function() {
    integration(function(contextRef) {
        it('Palpatine\'s undeployed ability should deal 1 damage and draw a card at the cost of defeating a friendly unit, exhausting self, and paying 1 resource', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'emperor-palpatine#galactic-ruler',
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'tie-advanced', upgrades: ['shield'] }],
                    resources: 5
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emperorPalpatine);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tieAdvanced]);
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.tieAdvanced);
            expect(context.tieAdvanced).toBeInZone('discard');
            expect(context.emperorPalpatine.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(1);

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.atst]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.atst);
            expect(context.atst.damage).toBe(1);
            expect(context.player1.handSize).toBe(1);
            expect(context.getChatLogs(2)).toContain('player1 uses Emperor Palpatine, exhausting Emperor Palpatine and defeating TIE Advanced to choose a target for Emperor Palpatine and to draw a card');
            expect(context.getChatLogs(2)).toContain('player1 uses Emperor Palpatine to deal 1 damage to AT-ST');
        });

        it('Palpatine\'s undeployed ability should not be able to activate if there are no friendly units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'emperor-palpatine#galactic-ruler',
                    resources: 5
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                }
            });

            const { context } = contextRef;

            expect(context.emperorPalpatine).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('Palpatine\'s undeployed ability cannot be used to sacrifice a Pilot upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'emperor-palpatine#galactic-ruler',
                    spaceArena: [{ card: 'tie-advanced', upgrades: ['dagger-squadron-pilot'] }],
                    resources: 5
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emperorPalpatine);
            expect(context.player1).toBeAbleToSelectExactly([context.tieAdvanced]);
            context.player1.clickCard(context.tieAdvanced);
            context.player1.clickCard(context.atst);
            expect(context.tieAdvanced).toBeInZone('discard');
        });

        it('Palpatine\'s on-deploy ability should take control of a damaged unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'emperor-palpatine#galactic-ruler', exhausted: true },
                    spaceArena: [{ card: 'tie-advanced', damage: 1 }]
                },
                player2: {
                    groundArena: [{ card: 'wampa', damage: 1 }, 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emperorPalpatine);
            context.player1.clickPrompt('Deploy Emperor Palpatine');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tieAdvanced]);
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);
            expect(context.wampa.controller).toBe(context.player1Object);

            context.player2.passAction();
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);
            expect(context.wampa.exhausted).toBeTrue();
        });

        it('Palpatine\'s on-attack ability should defeat another friendly unit to deal 1 damage to a unit and draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'emperor-palpatine#galactic-ruler', deployed: true },
                    groundArena: ['battlefield-marine'],
                    spaceArena: [{ card: 'tie-advanced', upgrades: ['shield'] }]
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emperorPalpatine);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.tieAdvanced]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.tieAdvanced);

            expect(context.tieAdvanced).toBeInZone('discard');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.atst, context.emperorPalpatine]);
            context.player1.clickCard(context.atst);
            expect(context.atst.damage).toBe(1);
            expect(context.player1.handSize).toBe(1);
        });
    });
});
