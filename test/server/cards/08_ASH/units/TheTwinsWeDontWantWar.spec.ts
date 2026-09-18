describe('The Twins, We Don\'t Want War', function() {
    integration(function(contextRef) {
        it('should grant sentinel to a friendly ground unit for this phase when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-twins#we-dont-want-war'],
                    groundArena: ['jedi-consular'],
                    spaceArena: ['frontline-shuttle']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theTwins);

            expect(context.player1).toHavePrompt('Give another friendly unit Sentinel for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.frontlineShuttle, context.jediConsular]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.jediConsular);

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.jediConsular]);
            context.player2.clickCard(context.jediConsular);

            context.moveToNextActionPhase();
            context.player1.passAction();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.jediConsular, context.p1Base, context.theTwins]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(3);
        });

        it('should grant sentinel to a friendly space unit for this phase when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-twins#we-dont-want-war'],
                    groundArena: ['jedi-consular'],
                    spaceArena: ['frontline-shuttle']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theTwins);

            expect(context.player1).toHavePrompt('Give another friendly unit Sentinel for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.frontlineShuttle, context.jediConsular]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.frontlineShuttle);

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.frontlineShuttle]);
            context.player2.clickCard(context.frontlineShuttle);

            context.moveToNextActionPhase();
            context.player1.passAction();

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.frontlineShuttle, context.p1Base]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);
        });

        it('should be able to be passed when played', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-twins#we-dont-want-war'],
                    groundArena: ['jedi-consular'],
                    spaceArena: ['frontline-shuttle']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theTwins);

            expect(context.player1).toHavePrompt('Give another friendly unit Sentinel for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.frontlineShuttle, context.jediConsular]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.frontlineShuttle, context.p1Base]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);
            expect(context.frontlineShuttle.hasSomeKeyword('sentinel')).toBeFalse();
            expect(context.jediConsular.hasSomeKeyword('sentinel')).toBeFalse();
        });

        it('should grant sentinel to a friendly space unit for this phase on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jedi-consular', 'the-twins#we-dont-want-war'],
                    spaceArena: ['frontline-shuttle']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theTwins);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Give another friendly unit Sentinel for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.frontlineShuttle, context.jediConsular]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.frontlineShuttle);

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.frontlineShuttle]);
            context.player2.clickCard(context.frontlineShuttle);

            context.moveToNextActionPhase();
            context.player1.passAction();

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.frontlineShuttle, context.p1Base]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);
        });

        it('should grant sentinel to a friendly ground unit for this phase on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jedi-consular', 'the-twins#we-dont-want-war'],
                    spaceArena: ['frontline-shuttle']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theTwins);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Give another friendly unit Sentinel for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.frontlineShuttle, context.jediConsular]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.jediConsular);

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.jediConsular]);
            context.player2.clickCard(context.jediConsular);

            context.moveToNextActionPhase();
            context.player1.passAction();

            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.jediConsular, context.p1Base, context.theTwins]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(3);
        });

        it('should be able to be passed on attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jedi-consular', 'the-twins#we-dont-want-war'],
                    spaceArena: ['frontline-shuttle']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theTwins);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePrompt('Give another friendly unit Sentinel for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.frontlineShuttle, context.jediConsular]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.frontlineShuttle, context.p1Base]);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);
            expect(context.frontlineShuttle.hasSomeKeyword('sentinel')).toBeFalse();
            expect(context.jediConsular.hasSomeKeyword('sentinel')).toBeFalse();
        });

        it('should heal 1 damage from the base if a friendly unit is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    groundArena: ['jedi-consular', 'the-twins#we-dont-want-war'],
                    spaceArena: ['frontline-shuttle'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    base: { card: 'chopper-base', damage: 5 }
                },
                player2: {
                    hand: ['rivals-fall', 'superlaser-blast'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    base: { card: 'nadiri-dockyards', damage: 5 },
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.jediConsular);

            expect(context.p1Base.damage).toBe(4);
            expect(context.p2Base.damage).toBe(5);
            expect(context.jediConsular).toBeInZone('discard', context.player1);
        });

        it('should heal 1 damage from the base if a friendly leader unit is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    groundArena: ['jedi-consular', 'the-twins#we-dont-want-war'],
                    spaceArena: ['frontline-shuttle'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    base: { card: 'chopper-base', damage: 5 }
                },
                player2: {
                    hand: ['rivals-fall', 'superlaser-blast'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    base: { card: 'nadiri-dockyards', damage: 5 },
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.grandInquisitor);

            expect(context.p1Base.damage).toBe(4);
            expect(context.p2Base.damage).toBe(5);
        });

        it('should not heal 1 damage from the base if it is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    groundArena: ['jedi-consular', 'the-twins#we-dont-want-war'],
                    spaceArena: ['frontline-shuttle'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    base: { card: 'chopper-base', damage: 5 }
                },
                player2: {
                    hand: ['rivals-fall', 'superlaser-blast'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    base: { card: 'nadiri-dockyards', damage: 5 },
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.theTwins);

            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(5);
            expect(context.theTwins).toBeInZone('discard', context.player1);
        });

        it('should heal 3 damage from the base if a units are defeated simultaneously with it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['vanquish'],
                    groundArena: ['jedi-consular', 'the-twins#we-dont-want-war'],
                    spaceArena: ['frontline-shuttle'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    base: { card: 'chopper-base', damage: 5 }
                },
                player2: {
                    hand: ['rivals-fall', 'superlaser-blast'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    base: { card: 'nadiri-dockyards', damage: 5 },
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.superlaserBlast);

            context.player1.clickPrompt('Resolve all (3)');

            expect(context.p1Base.damage).toBe(2);
            expect(context.p2Base.damage).toBe(5);
        });

        it('should not heal 1 damage from the base if an enemy unit is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                    groundArena: ['jedi-consular', 'the-twins#we-dont-want-war'],
                    spaceArena: ['frontline-shuttle'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    base: { card: 'chopper-base', damage: 5 }
                },
                player2: {
                    hand: ['superlaser-blast'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    base: { card: 'nadiri-dockyards', damage: 5 },
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.p1Base.damage).toBe(5);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
        });

        it('should not heal 1 damage from the base if an enemy leader unit is defeated', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall'],
                    groundArena: ['jedi-consular', 'the-twins#we-dont-want-war'],
                    spaceArena: ['frontline-shuttle'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    base: { card: 'chopper-base', damage: 5 }
                },
                player2: {
                    hand: ['superlaser-blast'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing'],
                    base: { card: 'nadiri-dockyards', damage: 5 },
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.cadBane);

            expect(context.p1Base.damage).toBe(5);
        });
    });
});