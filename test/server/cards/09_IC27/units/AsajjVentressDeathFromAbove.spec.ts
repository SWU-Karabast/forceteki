describe('Asajj Ventress, Death From Above', function () {
    integration(function (contextRef) {
        const swapPrompt = (attackerTitle: string) =>
            `Reveal Asajj Ventress and pay 5 resources (Cunning, Villainy) to return ${attackerTitle} to its owner's hand and put Asajj Ventress into play as the attacker`;

        describe('when a friendly ground unit would deal combat damage to a base', function () {
            it('can be revealed from hand to return the attacker and deal combat damage to the base instead', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.asajjVentressDeathFromAbove).toBeInZone('groundArena');
                expect(context.asajjVentressDeathFromAbove.exhausted).toBeTrue();
                expect(context.asajjVentressDeathFromAbove.isAttacking()).toBeFalse();
                expect(context.p2Base.damage).toBe(5);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.getChatLogs(2)).toEqual([
                    'player1 uses Asajj Ventress to reveal Asajj Ventress and then to pay 5 resources (Cunning, Villainy)',
                    'player1 uses Asajj Ventress to return Battlefield Marine to its owner\'s hand and put Asajj Ventress into play as the attacker'
                ]);
                expect(context.player2).toBeActivePlayer();
            });

            it('lets the attacker deal its combat damage if the player passes', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.asajjVentressDeathFromAbove).toBeInZone('hand');
                expect(context.p2Base.damage).toBe(3);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('charges the aspect penalty for a missing Villainy aspect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        base: 'kestro-city',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.p2Base.damage).toBe(5);
            });

            it('charges the aspect penalty for both missing aspects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.player1.exhaustedResourceCount).toBe(9);
                expect(context.p2Base.damage).toBe(5);
            });

            it('is not offered if the player cannot pay the cost including the aspect penalty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        resources: 8,
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);
                expect(context.asajjVentressDeathFromAbove).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('removes a token attacker from the game', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['clone-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Clone Trooper'));
                context.player1.clickPrompt('Trigger');

                expect(context.cloneTrooper).toBeInZone('outsideTheGame');
                expect(context.asajjVentressDeathFromAbove).toBeInZone('groundArena');
                expect(context.p2Base.damage).toBe(5);
            });

            it('returns an attacker owned by the opponent to its owner\'s hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: [{ card: 'battlefield-marine', owner: 'player2' }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toBeInZone('hand', context.player2);
                expect(context.asajjVentressDeathFromAbove).toBeInZone('groundArena', context.player1);
                expect(context.p2Base.damage).toBe(5);
            });

            it('defeats the upgrades on the returned attacker', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['academy-training', 'shield'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.academyTraining).toBeInZone('discard');
                expect(context.shield).toBeInZone('outsideTheGame');
                expect(context.p2Base.damage).toBe(5);
            });
        });

        describe('is not offered', function () {
            it('when a friendly leader unit attacks a base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'asajj-ventress#unparalleled-adversary', deployed: true },
                        hand: ['asajj-ventress#death-from-above']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.asajjVentressUnparalleledAdversary);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(3);
                expect(context.asajjVentressDeathFromAbove).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('when a friendly space unit attacks a base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        spaceArena: ['tieln-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tielnFighter);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.asajjVentressDeathFromAbove).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('when an enemy ground unit attacks a base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.asajjVentressDeathFromAbove).toBeInZone('hand');
                expect(context.player1).toBeActivePlayer();
            });

            it('when a friendly ground unit attacks a unit, even if it deals Overwhelm damage to the base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['ruthless-assassin']
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ruthlessAssassin);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(2);
                expect(context.asajjVentressDeathFromAbove).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('when the attacker has no power and would deal no combat damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['compassionate-senator']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.compassionateSenator);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(0);
                expect(context.asajjVentressDeathFromAbove).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('as the new attacker', function () {
            it('gets bonuses that apply while attacking', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'ig88#ruthless-bounty-hunter', deployed: true },
                        base: 'kestro-city',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                // Raid 1 from IG-88
                expect(context.p2Base.damage).toBe(6);
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });

            it('does not keep bonuses the previous attacker got for this attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above', 'surprise-strike'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.surpriseStrike);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.p2Base.damage).toBe(5);
            });

            it('deals the combat damage, so the previous attacker\'s combat damage abilities do not trigger', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['seventh-sister#implacable-inquisitor']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.seventhSister);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Seventh Sister'));
                context.player1.clickPrompt('Trigger');

                expect(context.seventhSister).toBeInZone('hand');
                expect(context.p2Base.damage).toBe(5);
                expect(context.wampa.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('deals the combat damage for abilities that trigger on a friendly unit dealing combat damage to a base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sabe#queens-shadow',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        deck: ['wampa', 'atst', 'cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.p2Base.damage).toBe(5);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader. If you do, look at the top 2 cards of the defending player\'s deck. Discard 1 of those cards');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
            });

            it('deals the combat damage that "when attack ends" abilities see for this attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'shin-hati#eager-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.p2Base.damage).toBe(5);
                expect(context.player1).toHavePassAbilityPrompt('Exhaust a unit that costs less than 5');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Exhaust a unit that costs less than 5');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.shinHati.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('is put into play, not played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'asajj-ventress#unparalleled-adversary',
                    hand: ['asajj-ventress#death-from-above', 'vanguard-ace'],
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
            context.player1.clickPrompt('Trigger');

            context.player2.passAction();

            // Vanguard Ace counts the other cards played this phase
            context.player1.clickCard(context.vanguardAce);
            expect(context.vanguardAce).toHaveExactUpgradeNames([]);
        });

        it('counts as a unit that entered play this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'asajj-ventress#unparalleled-adversary',
                    hand: ['asajj-ventress#death-from-above'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['hello-there'],
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
            context.player1.clickPrompt('Trigger');

            context.player2.clickCard(context.helloThere);
            expect(context.player2).toBeAbleToSelectExactly([context.asajjVentressDeathFromAbove]);
            context.player2.clickCard(context.asajjVentressDeathFromAbove);

            expect(context.asajjVentressDeathFromAbove.getPower()).toBe(1);
            expect(context.asajjVentressDeathFromAbove.getHp()).toBe(3);
        });

        it('enters play ready if friendly units enter play ready', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'asajj-ventress#unparalleled-adversary',
                    base: 'mos-eisley',
                    hand: ['asajj-ventress#death-from-above'],
                    groundArena: ['battlefield-marine', 'ritual-dragon']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
            context.player1.clickPrompt('Trigger');

            expect(context.asajjVentressDeathFromAbove).toBeInZone('groundArena');
            expect(context.asajjVentressDeathFromAbove.exhausted).toBeFalse();
            expect(context.p2Base.damage).toBe(5);
        });

        describe('when another copy of her is already in play', function () {
            it('deals the combat damage if the player keeps the new copy', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['asajj-ventress#death-from-above', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;
                const [inHand, inPlay] = context.player1.findCardsByName('asajj-ventress#death-from-above', 'hand')
                    .concat(context.player1.findCardsByName('asajj-ventress#death-from-above', 'groundArena'));

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Choose which copy of Asajj Ventress, Death From Above to defeat');
                expect(context.player1).toBeAbleToSelectExactly([inHand, inPlay]);
                context.player1.clickCard(inPlay);

                expect(inPlay).toBeInZone('discard');
                expect(inHand).toBeInZone('groundArena');
                expect(context.p2Base.damage).toBe(5);
            });

            it('deals no combat damage if the player defeats the new copy', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'asajj-ventress#unparalleled-adversary',
                        hand: ['asajj-ventress#death-from-above'],
                        groundArena: ['asajj-ventress#death-from-above', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;
                const [inHand, inPlay] = context.player1.findCardsByName('asajj-ventress#death-from-above', 'hand')
                    .concat(context.player1.findCardsByName('asajj-ventress#death-from-above', 'groundArena'));

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt(swapPrompt('Battlefield Marine'));
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Choose which copy of Asajj Ventress, Death From Above to defeat');
                context.player1.clickCard(inHand);

                expect(inHand).toBeInZone('discard');
                expect(inPlay).toBeInZone('groundArena');
                expect(context.battlefieldMarine).toBeInZone('hand');
                expect(context.p2Base.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
