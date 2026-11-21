describe('Leia\'s Disguise', function () {
    integration(function (contextRef) {
        it('Leia\'s Disguise can only attach to non-Vehicle units and grants Underworld trait to the attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leias-disguise', 'ma-klounkee'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['inspectors-shuttle']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            // Play Leia's Disguise — can NOT target Vehicles
            context.player1.clickCard(context.leiasDisguise);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);

            // Attach to a non-Vehicle unit and gain Underworld trait
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            context.player1.clickCard(context.maKlounkee);

            // battlefield marine has gained Underworld trait
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.atst);
        });

        it('Leia\'s Disguise, when attached to Leia Organa, should give a Shield to a friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leias-disguise'],
                    groundArena: ['leia-organa#defiant-princess', 'battlefield-marine']
                }
            });

            const { context } = contextRef;

            // Attach to Leia Organa
            context.player1.clickCard(context.leiasDisguise);
            expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana, context.battlefieldMarine]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.leiaOrgana);

            // Conditional on-play effect should trigger: give a Shield to a friendly unit
            expect(context.player1).toHavePrompt('Give a Shield token to a friendly unit');
            // Can shield Leia or another friendly unit
            expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            expect(context.leiasDisguise).toBeAttachedTo(context.leiaOrgana);
        });

        it('Leia\'s Disguise does not offer a Shield if attached to a non-Leia unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['leias-disguise'],
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.leiasDisguise);
            context.player1.clickCard(context.battlefieldMarine);

            // No prompt to give Shield should appear; turn passes
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).not.toHaveExactUpgradeNames(['shield']);
        });

        describe('When another copy of Leia\'s Disguise is already in play for the same controller,', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['leias-disguise'],
                        groundArena: [
                            { card: 'leia-organa#defiant-princess', upgrades: ['leias-disguise'] },
                            'battlefield-marine'
                        ]
                    }
                });

                const { context } = contextRef;
                const copies = context.player1.findCardsByName('leias-disguise');
                context.copyInHand = copies.find((copy) => copy.zoneName === 'hand');
                context.copyInPlay = copies.find((copy) => copy.zoneName === 'groundArena');
            });

            it('defeating the copy that was just played (unique rule) does not throw and gives no Shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePrompt('Choose which copy of Leia\'s Disguise to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.copyInHand, context.copyInPlay]);

                // The copy just played is defeated: its When Played ability is checked while it is attached to nothing
                context.player1.clickCard(context.copyInHand);

                expect(context.copyInHand).toBeInZone('discard');
                expect(context.copyInPlay).toBeAttachedTo(context.leiaOrgana);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.leiaOrgana).toHaveExactUpgradeNames(['leias-disguise']);
                expect(context.player2).toBeActivePlayer();
            });

            it('defeating the copy that was already in play leaves the new copy on the non-Leia unit, with no Shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.copyInHand);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePrompt('Choose which copy of Leia\'s Disguise to defeat');
                context.player1.clickCard(context.copyInPlay);

                expect(context.copyInPlay).toBeInZone('discard');
                expect(context.copyInHand).toBeAttachedTo(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['leias-disguise']);
                expect(context.leiaOrgana).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When the copy played on Leia Organa is the one the unique rule defeats,', function () {
            it('does not throw; the defeated upgrade is no longer attached, so its When Played ability gives no Shield (behaviour recorded, whether the rules want last known information here is open)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['leias-disguise'],
                        groundArena: [
                            'leia-organa#defiant-princess',
                            { card: 'battlefield-marine', upgrades: ['leias-disguise'] }
                        ]
                    }
                });

                const { context } = contextRef;
                const copies = context.player1.findCardsByName('leias-disguise');
                const copyInHand = copies.find((copy) => copy.zoneName === 'hand');
                const copyInPlay = copies.find((copy) => copy.zoneName === 'groundArena');

                context.player1.clickCard(copyInHand);
                context.player1.clickCard(context.leiaOrgana);

                expect(context.player1).toHavePrompt('Choose which copy of Leia\'s Disguise to defeat');
                context.player1.clickCard(copyInHand);

                expect(copyInHand).toBeInZone('discard');
                expect(copyInPlay).toBeAttachedTo(context.battlefieldMarine);
                expect(context.leiaOrgana).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['leias-disguise']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
