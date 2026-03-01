describe('Taramyn Barcona, Eyes Front!', function () {
    integration(function (contextRef) {
        it('should defeat a friendly Credit, give him Experience, and give a friendly unit Experience', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['taramyn-barcona#eyes-front'],
                    groundArena: ['wampa'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'data-vault',
                    resources: 7,
                    credits: 3,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['ruthless-raider'],
                    credits: 3,
                }
            });

            const { context } = contextRef;
            const p1Credits = context.player1.findCardsByName('credit');
            const p2Credits = context.player2.findCardsByName('credit');

            context.player1.clickCard(context.taramynBarconaEyesFront);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.strafingGunship]);
            expect(context.player1).toHavePrompt('Give an Experience token to this unit and a friendly unit');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.taramynBarconaEyesFront).toHaveExactUpgradeNames(['experience']);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat an enemy Credit, give him Experience, and give a friendly unit Experience', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['taramyn-barcona#eyes-front'],
                    groundArena: ['wampa'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'data-vault',
                    resources: 7,
                    credits: 3,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['ruthless-raider'],
                    credits: 3,
                }
            });

            const { context } = contextRef;
            const p1Credits = context.player1.findCardsByName('credit');
            const p2Credits = context.player2.findCardsByName('credit');

            context.player1.clickCard(context.taramynBarconaEyesFront);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p2Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.strafingGunship]);
            expect(context.player1).toHavePrompt('Give an Experience token to this unit and a friendly unit');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.taramynBarconaEyesFront).toHaveExactUpgradeNames(['experience']);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.player1.credits).toBe(3);
            expect(context.player2.credits).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat a friendly Credit, give him Experience, and give a friendly unit Experience if there are no enemy Credits', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['taramyn-barcona#eyes-front'],
                    groundArena: ['wampa'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'data-vault',
                    resources: 7,
                    credits: 3,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['ruthless-raider'],
                }
            });

            const { context } = contextRef;
            const p1Credits = context.player1.findCardsByName('credit');
            const p2Credits = context.player2.findCardsByName('credit');

            context.player1.clickCard(context.taramynBarconaEyesFront);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.strafingGunship]);
            expect(context.player1).toHavePrompt('Give an Experience token to this unit and a friendly unit');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.taramynBarconaEyesFront).toHaveExactUpgradeNames(['experience']);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat an enemy Credit, give him Experience, and give a friendly unit Experience if there are no friendly Credits', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['taramyn-barcona#eyes-front'],
                    groundArena: ['wampa'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'data-vault',
                    resources: 7,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['ruthless-raider'],
                    credits: 3,
                }
            });

            const { context } = contextRef;
            const p1Credits = context.player1.findCardsByName('credit');
            const p2Credits = context.player2.findCardsByName('credit');

            context.player1.clickCard(context.taramynBarconaEyesFront);

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p2Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.strafingGunship]);
            expect(context.player1).toHavePrompt('Give an Experience token to this unit and a friendly unit');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.taramynBarconaEyesFront).toHaveExactUpgradeNames(['experience']);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.player1.credits).toBe(0);
            expect(context.player2.credits).toBe(2);

            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['taramyn-barcona#eyes-front'],
                    groundArena: ['wampa'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'data-vault',
                    resources: 7,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['ruthless-raider'],
                    credits: 3,
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.taramynBarconaEyesFront);
            context.player1.clickPrompt('Pass');

            expect(context.taramynBarconaEyesFront).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.strafingGunship).toHaveExactUpgradeNames([]);
            expect(context.player2.credits).toBe(3);
            expect(context.player1.credits).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing if nobody has Credits', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['taramyn-barcona#eyes-front'],
                    groundArena: ['wampa'],
                    spaceArena: ['strafing-gunship'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'data-vault',
                    resources: 7,
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['ruthless-raider'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.taramynBarconaEyesFront);

            expect(context.taramynBarconaEyesFront).toHaveExactUpgradeNames([]);
            expect(context.wampa).toHaveExactUpgradeNames([]);
            expect(context.strafingGunship).toHaveExactUpgradeNames([]);
            expect(context.player2.credits).toBe(0);
            expect(context.player1.credits).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });
    });
});