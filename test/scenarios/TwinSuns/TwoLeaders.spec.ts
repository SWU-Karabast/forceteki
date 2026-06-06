
describe('Twin Suns dual-leader in-game support', function () {
    integration(function (contextRef) {
        describe('leader accessors and aspects', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        // Luke: [heroism, command]  |  Saw: [command, aggression]  |  base kestro-city: [aggression]
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        secondLeader: 'director-krennic#aspiring-to-authority',
                        base: 'administrators-tower',
                    }
                });
            });

            it('player.getSingleLeader() throws when there are two leaders', function () {
                const { context } = contextRef;
                expect(() => context.player1Object.getSingleLeader()).toThrow();
            });

            it('player.getAllLeaders() returns the primary leader first', function () {
                const { context } = contextRef;
                expect(context.player1Object.getAllLeaders()[0].internalName).toBe('luke-skywalker#faithful-friend');
                expect(context.player2Object.getAllLeaders()[0].internalName).toBe('darth-vader#dark-lord-of-the-sith');
            });

            it('player.getAllLeaders() returns the second leader at index 1 (not null)', function () {
                const { context } = contextRef;
                expect(context.player1Object.getAllLeaders()[1]).not.toBeNull();
                expect(context.player1Object.getAllLeaders()[1].internalName).toBe('saw-gerrera#bring-down-the-empire');
                expect(context.player2Object.getAllLeaders()[1]).not.toBeNull();
                expect(context.player2Object.getAllLeaders()[1].internalName).toBe('director-krennic#aspiring-to-authority');
            });

            it('player.getAllLeaders() returns both leaders with length 2', function () {
                const { context } = contextRef;
                expect(context.player1Object.getAllLeaders().length).toBe(2);
                const p1Names = context.player1Object.getAllLeaders().map((l: any) => l.internalName);
                expect(p1Names).toContain('luke-skywalker#faithful-friend');
                expect(p1Names).toContain('saw-gerrera#bring-down-the-empire');

                expect(context.player2Object.getAllLeaders().length).toBe(2);
            });

            it('player.getAspects() includes aspects from both leaders and the base', function () {
                const { context } = contextRef;
                // Luke: heroism + command; Saw: command + aggression; kestro-city: aggression
                const p1Aspects = context.player1Object.getAspects();
                expect(p1Aspects).toContain('heroism');
                expect(p1Aspects).toContain('command');
                expect(p1Aspects).toContain('aggression');
            });

            it('context.p1SecondLeader and p2SecondLeader are set on the test context', function () {
                const { context } = contextRef;
                expect(context.p1SecondLeader).not.toBeNull();
                expect(context.p1SecondLeader.internalName).toBe('saw-gerrera#bring-down-the-empire');
                expect(context.p2SecondLeader).not.toBeNull();
            });
        });

        describe('aspect penalty uses the combined leader aspect pool', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        // Luke: [heroism, command] | Saw: [command, aggression] | kestro-city: [aggression]
                        // Combined: heroism, command, aggression â€” missing: cunning
                        // Greedo (SOR_204): cost 1, cunning â†’ total cost with penalty = 1 + 2 = 3
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: ['greedo#slow-on-the-draw'],
                        resources: 3,
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                    }
                });
            });

            it('a card with an out-of-aspect aspect costs +2 and is unplayable without the penalty resources', function () {
                const { context } = contextRef;
                // With only 2 resources Greedo (1 base + 2 penalty) is unaffordable
                context.player1.exhaustResources(1);
                expect(context.greedo).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('a card with an out-of-aspect aspect is playable when the player has enough for the penalty', function () {
                const { context } = contextRef;
                // 3 resources covers the 1 base cost + 2 cunning penalty
                context.player1.clickCard(context.greedo);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });

        describe('independent leader deployment', function () {
            describe('when only the primary leader is deployed', function () {
                beforeEach(function () {
                    return contextRef.setupTestAsync({
                        phase: 'action',
                        format: 'fauxSuns',
                        player1: {
                            leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                            secondLeader: 'saw-gerrera#bring-down-the-empire',
                            base: 'kestro-city',
                        },
                        player2: {
                            leader: 'darth-vader#dark-lord-of-the-sith',
                            base: 'administrators-tower',
                        }
                    });
                });

                it('the second leader remains in the base zone', function () {
                    const { context } = contextRef;
                    expect(context.player1Object.getAllLeaders()[0].zoneName).toBe('groundArena');
                    expect(context.player1Object.getAllLeaders()[1].zoneName).toBe('base');
                });
            });

            describe('when only the second leader is deployed', function () {
                beforeEach(function () {
                    return contextRef.setupTestAsync({
                        phase: 'action',
                        format: 'fauxSuns',
                        player1: {
                            leader: 'luke-skywalker#faithful-friend',
                            secondLeader: { card: 'saw-gerrera#bring-down-the-empire', deployed: true },
                            base: 'kestro-city',
                        },
                        player2: {
                            leader: 'darth-vader#dark-lord-of-the-sith',
                            base: 'administrators-tower',
                        }
                    });
                });

                it('the primary leader remains in the base zone', function () {
                    const { context } = contextRef;
                    expect(context.player1Object.getAllLeaders()[1].zoneName).toBe('groundArena');
                    expect(context.player1Object.getAllLeaders()[0].zoneName).toBe('base');
                });
            });
        });

        describe('second leader non-epic action ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        // Saw's action: exhaust â†’ target friendly unit gets +2/+0, Overwhelm, then is defeated
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                        groundArena: ['death-star-stormtrooper'],
                    }
                });
            });

            it('the second leader\'s non-epic action can be activated and takes effect', function () {
                const { context } = contextRef;

                // Activate Saw's action ability (exhaust Saw, pick a unit to attack with)
                context.player1.clickCard(context.sawGerrera);
                context.player1.clickPrompt('Attack with a unit. It gets +2/+0 and gains Overwhelm for this attack. After completing this attack, defeat it.');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.deathStarStormtrooper);

                // Marine (base 3/3) attacks with +2 power = 5, killing the 2-hp stormtrooper;
                // then Marine is defeated per Saw's effect
                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.sawGerrera.exhausted).toBeTrue();
            });
        });

        describe('second leader outside FauxSuns format', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        base: 'kestro-city',
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                    }
                });
            });

            it('getAllLeaders() returns only one leader and index 1 is undefined in a standard Premier game', function () {
                const { context } = contextRef;
                expect(context.player1Object.getAllLeaders().length).toBe(1);
                expect(context.player1Object.getAllLeaders()[1]).toBeUndefined();
                expect(context.player2Object.getAllLeaders().length).toBe(1);
                expect(context.player2Object.getAllLeaders()[1]).toBeUndefined();
            });
        });

        describe('regroup phase readies both leaders', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        secondLeader: 'director-krennic#aspiring-to-authority',
                        base: 'administrators-tower',
                    }
                });
            });

            it('both leaders are readied at the start of the next action phase', function () {
                const { context } = contextRef;

                // Exhaust both leaders directly so the test doesn't depend on specific ability targeting.
                context.exhaustCard(context.lukeSkywalker);
                expect(context.lukeSkywalker.exhausted).toBeTrue();

                context.exhaustCard(context.sawGerrera);
                expect(context.sawGerrera.exhausted).toBeTrue();

                // Advance through regroup and into the next action phase
                context.moveToNextActionPhase();

                expect(context.lukeSkywalker.exhausted).toBeFalse();
                expect(context.sawGerrera.exhausted).toBeFalse();
            });
        });
    });
});

