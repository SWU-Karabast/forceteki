describe('For The Republic', function() {
    integration(function(contextRef) {
        describe('For The Republic\'s ability', function() {
            it('should cost 3 when you do not control at least 3 Republic units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['for-the-republic'],
                        groundArena: ['clone-pilot', 'battlefield-marine'],
                        spaceArena: ['jedi-light-cruiser'],
                        base: 'dagobah-swamp',
                        leader: 'luke-skywalker#faithful-friend',
                    },
                    player2: {
                        groundArena: ['falchion-ion-tank'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.forTheRepublic);
                context.player1.clickCard(context.jediLightCruiser);

                expect(context.jediLightCruiser).toHaveExactUpgradeNames(['for-the-republic']);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should cost 1 when you control at least 3 Republic units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['for-the-republic'],
                        groundArena: ['clone-pilot', 'falchion-ion-tank', 'battlefield-marine'],
                        spaceArena: ['jedi-light-cruiser'],
                        base: 'dagobah-swamp',
                        leader: 'luke-skywalker#faithful-friend',
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.forTheRepublic);
                context.player1.clickCard(context.jediLightCruiser);

                expect(context.jediLightCruiser).toHaveExactUpgradeNames(['for-the-republic']);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('gives the attached unit Coordinate - Restore 2', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['for-the-republic'],
                        groundArena: ['clone-pilot', 'battlefield-marine'],
                        spaceArena: ['jedi-light-cruiser'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                        leader: 'luke-skywalker#faithful-friend',
                    },
                    player2: {
                        hand: ['vanquish'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.forTheRepublic);
                context.player1.clickCard(context.clonePilot);

                expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeTrue();
                expect(context.clonePilot.hasSomeKeyword('restore')).toBeTrue();

                context.player2.passAction();

                expect(context.p1Base.damage).toBe(5);

                // Player 1 attacks with Clone Pilot with coordinate active
                context.player1.clickCard(context.clonePilot);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.p2Base.damage).toBe(4);

                // Player 2 defeats Jedi Light Cruiser
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.jediLightCruiser);

                expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeTrue();
                expect(context.clonePilot.hasSomeKeyword('restore')).toBeFalse();

                // Player 1 attacks with Clone Pilot with coordinate inactive
                context.readyCard(context.clonePilot);
                context.player1.clickCard(context.clonePilot);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.p2Base.damage).toBe(8);
            });

            it('gives the attached unit Coordinate - Restore 2 only while attached to it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'clone-pilot', upgrades: ['for-the-republic'] }, 'battlefield-marine'],
                        spaceArena: ['jedi-light-cruiser'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                        leader: 'luke-skywalker#faithful-friend',
                    },
                    player2: {
                        hand: ['disabling-fang-fighter'],
                    }
                });

                const { context } = contextRef;

                expect(context.p1Base.damage).toBe(5);
                expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeTrue();
                expect(context.clonePilot.hasSomeKeyword('restore')).toBeTrue();

                // Player 1 attacks with Clone Pilot with coordinate and restore active
                context.player1.clickCard(context.clonePilot);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(3);

                // Player 2 defeats For The Republic
                context.player2.clickCard(context.disablingFangFighter);
                context.player2.clickCard(context.forTheRepublic);

                expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeFalse();
                expect(context.clonePilot.hasSomeKeyword('restore')).toBeFalse();

                // Player 1 attacks with Clone Pilot without coordinate and restore
                context.readyCard(context.clonePilot);
                context.player1.clickCard(context.clonePilot);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(3);
            });

            it('gives the attached unit Coordinate - Restore 2 to the new unit when moved', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['survivors-gauntlet'],
                        groundArena: [{ card: 'clone-pilot', upgrades: ['for-the-republic'] }, 'battlefield-marine'],
                        spaceArena: ['jedi-light-cruiser'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                        leader: 'luke-skywalker#faithful-friend',
                    }
                });

                const { context } = contextRef;

                expect(context.p1Base.damage).toBe(5);
                expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeTrue();
                expect(context.clonePilot.hasSomeKeyword('restore')).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('coordinate')).toBeFalse();
                expect(context.battlefieldMarine.hasSomeKeyword('restore')).toBeFalse();

                // Player 1 moves For The Republic to Battlefield Marine
                context.player1.clickCard(context.survivorsGauntlet);
                context.player1.clickCard(context.forTheRepublic);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeFalse();
                expect(context.clonePilot.hasSomeKeyword('restore')).toBeFalse();
                expect(context.battlefieldMarine.hasSomeKeyword('coordinate')).toBeTrue();
                expect(context.battlefieldMarine.hasSomeKeyword('restore')).toBeTrue();

                context.player2.passAction();

                // Player 1 attacks with Clone Pilot that doesn't have coordinate and restore anymore
                context.player1.clickCard(context.clonePilot);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(5);

                context.player2.passAction();

                // Player 1 attacks with Battlefield Marine with coordinate and restore
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(3);
            });

            describe('when the attached unit changes controller', function () {
                it('the Coordinate ability stays active', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'clone-pilot', upgrades: ['for-the-republic'] }, 'battlefield-marine'],
                            spaceArena: ['jedi-light-cruiser'],
                            base: { card: 'dagobah-swamp', damage: 5 },
                            leader: 'luke-skywalker#faithful-friend',
                        },
                        player2: {
                            groundArena: ['isb-agent'],
                            spaceArena: ['disabling-fang-fighter'],
                            base: { card: 'mos-eisley', damage: 5 },
                            hand: ['change-of-heart'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeTrue();
                    expect(context.clonePilot.hasSomeKeyword('restore')).toBeTrue();

                    context.player2.clickCard(context.changeOfHeart);
                    context.player2.clickCard(context.clonePilot);

                    expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeTrue();
                    expect(context.clonePilot.hasSomeKeyword('restore')).toBeTrue();

                    context.player1.passAction();

                    context.player2.clickCard(context.clonePilot);
                    context.player2.clickCard(context.p1Base);

                    expect(context.p2Base.damage).toBe(3);
                });

                it('the Coordinate ability becomes inactive', async function () {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: [{ card: 'clone-pilot', upgrades: ['for-the-republic'] }, 'battlefield-marine'],
                            spaceArena: ['jedi-light-cruiser'],
                            base: { card: 'dagobah-swamp', damage: 5 },
                            leader: 'luke-skywalker#faithful-friend',
                        },
                        player2: {
                            groundArena: ['isb-agent'],
                            base: { card: 'mos-eisley', damage: 5 },
                            hand: ['change-of-heart'],
                            hasInitiative: true
                        }
                    });

                    const { context } = contextRef;

                    expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeTrue();
                    expect(context.clonePilot.hasSomeKeyword('restore')).toBeTrue();

                    context.player2.clickCard(context.changeOfHeart);
                    context.player2.clickCard(context.clonePilot);

                    expect(context.clonePilot.hasSomeKeyword('coordinate')).toBeTrue();
                    expect(context.clonePilot.hasSomeKeyword('restore')).toBeFalse();

                    context.player1.passAction();

                    context.player2.clickCard(context.clonePilot);
                    context.player2.clickCard(context.p1Base);

                    expect(context.p2Base.damage).toBe(5);
                });
            });
        });
    });
});
