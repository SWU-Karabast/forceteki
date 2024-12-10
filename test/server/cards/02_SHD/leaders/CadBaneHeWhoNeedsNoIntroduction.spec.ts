describe('Cad Bane, He Who Needs No Introduction', function () {
    integration(function (contextRef) {
        it('Cad Bane\'s leader undeployed ability should cause an opponent to choose a unit and deal 1 damage to it when a friendly Underworld card is played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'pyke-sentinel'],
                    leader: 'cad-bane#he-who-needs-no-introduction',
                },
                player2: {
                    hand: ['cantina-braggart'],
                    groundArena: ['wampa'],
                    spaceArena: ['tie-advanced'],
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            // CASE 1: opponent plays an Underworld card, no trigger
            context.player2.clickCard(context.cantinaBraggart);
            expect(context.player1).toBeActivePlayer();

            // CASE 2: controller plays a non-Underworld card, no trigger
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            // CASE 3: controller plays an Underworld card, ability triggers
            context.player1.clickCard(context.pykeSentinel);
            expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
            context.player1.clickPrompt('Exhaust this leader');

            expect(context.cadBane.exhausted).toBeTrue();
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.tieAdvanced, context.cantinaBraggart]);
            expect(context.player2).not.toHavePassAbilityButton();
            context.player2.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(1);

            expect(context.player2).toBeActivePlayer();
        });

        it('Cad Bane\'s leader deployed ability should cause an opponent to choose a unit and deal 2 damage to it when a friendly Underworld card is played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'pyke-sentinel', 'hylobon-enforcer', 'outlaw-corona'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                },
                player2: {
                    hand: ['cantina-braggart'],
                    groundArena: ['wampa'],
                    spaceArena: ['tie-advanced'],
                    hasInitiative: true
                },
            });

            const { context } = contextRef;

            // CASE 1: opponent plays an Underworld card, no trigger
            context.player2.clickCard(context.cantinaBraggart);
            expect(context.player1).toBeActivePlayer();

            // CASE 2: controller plays a non-Underworld card, no trigger
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            // CASE 3: controller plays an Underworld card, ability triggers
            context.player1.clickCard(context.pykeSentinel);
            expect(context.player1).toHavePassAbilityPrompt('The opponent chooses a unit they control. Deal 2 damage to it.');
            context.player1.clickPrompt('The opponent chooses a unit they control. Deal 2 damage to it.');

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.tieAdvanced, context.cantinaBraggart]);
            expect(context.player2).not.toHavePassAbilityButton();
            context.player2.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(2);

            // CASE 4: controller plays an Underworld card, ability limit is already reached
            context.player2.passAction();
            context.player1.clickCard(context.hylobonEnforcer);
            expect(context.player2).toBeActivePlayer();

            context.moveToNextActionPhase();

            // CASE 5: next round, ability is usable again
            context.player2.passAction();
            context.player1.clickCard(context.outlawCorona);
            expect(context.player1).toHavePassAbilityPrompt('The opponent chooses a unit they control. Deal 2 damage to it.');
            context.player1.clickPrompt('The opponent chooses a unit they control. Deal 2 damage to it.');

            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.tieAdvanced, context.cantinaBraggart]);
            expect(context.player2).not.toHavePassAbilityButton();
            context.player2.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(4);
        });
    });
});
