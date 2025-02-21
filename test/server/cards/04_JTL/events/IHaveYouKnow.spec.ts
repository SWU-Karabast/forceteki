describe('I Have You Now', function() {
    integration(function(contextRef) {
        it('I Have You Now\'s ability should start an attack with Vehicle unit and prevent all combat damage for that attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['i-have-you-now'],
                    groundArena: ['pyke-sentinel', 'atst'],
                    spaceArena: ['imperial-interceptor']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.iHaveYouNow);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor]);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.wampa);

            // Assert prevented damage
            expect(context.atst.damage).toBe(0);
        });

        it('I Have You Now\'s ability should start an attack with Vehicle unit and prevent all combat damage for that attack and unit has a shield choose to prevent damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['i-have-you-now'],
                    groundArena: ['pyke-sentinel', { card: 'atst', upgrades: ['shield'] }],
                    spaceArena: ['imperial-interceptor']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.iHaveYouNow);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor]);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.wampa);

            // Player should be prompted to choose which ability to resolve first
            expect(context.player1).toHaveExactPromptButtons(['Defeat shield to prevent attached unit from taking damage', 'Prevent all damage that would be dealt to it during this attack']);
            context.player1.clickPrompt('Prevent all damage that would be dealt to it during this attack');

            // Assert prevented damage
            expect(context.atst.damage).toBe(0);
            expect(context.atst).toHaveExactUpgradeNames(['shield']);
        });

        it('I Have You Now\'s ability should start an attack with Vehicle unit and prevent all combat damage for that attack and unit has a shield choose to prevent damage', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['i-have-you-now'],
                    groundArena: ['pyke-sentinel', { card: 'atst', upgrades: ['shield'] }],
                    spaceArena: ['imperial-interceptor']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.iHaveYouNow);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor]);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.wampa);

            // Player should be prompted to choose which ability to resolve first
            expect(context.player1).toHaveExactPromptButtons(['Defeat shield to prevent attached unit from taking damage', 'Prevent all damage that would be dealt to it during this attack']);
            context.player1.clickPrompt('Defeat shield to prevent attached unit from taking damage');

            // Assert prevented damage
            expect(context.atst.damage).toBe(0);
            expect(context.atst.isUpgraded()).toBeFalse();
        });

        it('I Have You Now\'s ability should start an attack with Vehicle unit and prevent all combat damage for that attack and Tarfful\'s ability', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['i-have-you-now'],
                    groundArena: ['pyke-sentinel', 'atst'],
                    spaceArena: ['imperial-interceptor']
                },
                player2: {
                    groundArena: ['gentle-giant', 'tarfful#kashyyyk-chieftain']
                }
            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.iHaveYouNow);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor]);
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.gentleGiant);

            // Tarfful ability triggers and targets ATST, no damage should be dealt
            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.pykeSentinel]);
            context.player2.clickCard(context.atst);

            // Assert prevented damage
            expect(context.atst.damage).toBe(0);
        });

        it('I Have You Now\'s ability should start an attack with Vehicle unit and prevent all combat damage for that attack but not for Rhokai Gunship\'s ability', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['i-have-you-now'],
                    groundArena: ['pyke-sentinel', 'atst'],
                    spaceArena: ['imperial-interceptor']
                },
                player2: {
                    spaceArena: ['rhokai-gunship']
                }
            });

            const { context } = contextRef;

            // Play the event
            context.player1.clickCard(context.iHaveYouNow);
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.imperialInterceptor]);
            context.player1.clickCard(context.imperialInterceptor);
            context.player1.clickCard(context.rhokaiGunship);

            // Rhokai Gunship's ability triggers and targets Imperial Interceptor, damage should be dealt as unit is not longer attacking
            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.pykeSentinel, context.imperialInterceptor, context.p1Base, context.p2Base]);
            context.player2.clickCard(context.imperialInterceptor);

            // Assert prevented damage
            expect(context.imperialInterceptor.damage).toBe(1);
        });
    });
});
