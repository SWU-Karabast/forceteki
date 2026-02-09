describe('Arvel Skeen, Win and Walk away', function () {
    integration(function (contextRef) {
        it('should defeat a friendly Credit and deal 1 damage to Arvel when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.arvelSkeen);

            expect(context.arvelSkeen.damage).toBe(1);
            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat an enemy Credit and deal 1 damage to enemy unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p2Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.credits).toBe(3);
            expect(context.player2.credits).toBe(2);

            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat a friendly Credit and deal 1 damage to a friendly unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(0);

            expect(context.wampa.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat a friendly Credit and deal 1 damage to friendly base when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.p1Base);

            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(0);

            expect(context.p1Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat a friendly Credit and deal 1 damage to enemy base when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.p2Base);

            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(0);

            expect(context.p2Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be passed when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickPrompt('Pass');

            expect(context.arvelSkeen.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2.credits).toBe(3);
            expect(context.player1.credits).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing if nobody has Credits when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);

            expect(context.arvelSkeen.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2.credits).toBe(0);
            expect(context.player1.credits).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat a friendly Credit and deal 1 damage to Arvel on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.arvelSkeen);

            expect(context.arvelSkeen.damage).toBe(1);
            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat an enemy Credit and deal 1 damage to enemy unit on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p2Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1.credits).toBe(3);
            expect(context.player2.credits).toBe(2);

            expect(context.battlefieldMarine.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat a friendly Credit and deal 1 damage to a friendly unit on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(3);

            expect(context.wampa.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat a friendly Credit and deal 1 damage to friendly base on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.p1Base);

            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(3);

            expect(context.p1Base.damage).toBe(1);
            expect(context.player2).toBeActivePlayer();
        });

        it('should defeat a friendly Credit and deal 1 damage to enemy base on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([...p1Credits, ...p2Credits]);
            context.player1.clickCard(p1Credits[0]);

            expect(context.player1).toBeAbleToSelectExactly([
                context.wampa,
                context.strafingGunship,
                context.arvelSkeen,
                context.battlefieldMarine,
                context.ruthlessRaider,
                context.p1Base,
                context.p2Base
            ]);
            expect(context.player1).toHavePrompt('Deal 1 damage to a unit or base');
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.p2Base);

            expect(context.player1.credits).toBe(2);
            expect(context.player2.credits).toBe(3);

            expect(context.p2Base.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to be passed on attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Pass');

            expect(context.arvelSkeen.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(4);
            expect(context.player2.credits).toBe(3);
            expect(context.player1.credits).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing if nobody has Credits when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'arvel-skeen#win-and-walk-away'],
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

            context.player1.clickCard(context.arvelSkeen);
            context.player1.clickCard(context.p2Base);

            expect(context.arvelSkeen.damage).toBe(0);
            expect(context.wampa.damage).toBe(0);
            expect(context.strafingGunship.damage).toBe(0);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.ruthlessRaider.damage).toBe(0);
            expect(context.p1Base.damage).toBe(0);
            expect(context.p2Base.damage).toBe(4);
            expect(context.player2.credits).toBe(0);
            expect(context.player1.credits).toBe(0);

            expect(context.player2).toBeActivePlayer();
        });
    });
});