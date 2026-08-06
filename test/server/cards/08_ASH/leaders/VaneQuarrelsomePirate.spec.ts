describe('Vane, Quarrelsome Pirate', function() {
    integration(function(contextRef) {
        describe('Leader side triggered ability', function() {
            it('should deal 2 damage to enemy base after defeating a friendly upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'vane#quarrelsome-pirate',
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }]
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.p1Tokens = {
                    advantage: context.player1.findCardByName('advantage'),
                };
                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player1.clickCard(context.vane);
                context.player1.clickPrompt('Deal 2 damage to a base');
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Choose a friendly upgrade to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Tokens.advantage, context.nimbleProwess]);
                context.player1.clickCard(context.nimbleProwess);

                expect(context.p2Base.damage).toBe(2);
                expect(context.p1Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to enemy base after defeating a friendly token upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'vane#quarrelsome-pirate',
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }]
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.p1Tokens = {
                    advantage: context.player1.findCardByName('advantage'),
                };
                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player1.clickCard(context.vane);
                context.player1.clickPrompt('Deal 2 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Choose a friendly upgrade to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Tokens.advantage, context.nimbleProwess]);
                context.player1.clickCard(context.p1Tokens.advantage);

                expect(context.p2Base.damage).toBe(2);
                expect(context.p1Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['nimble-prowess']);
            });

            it('should deal 2 damage to friendly base after defeating a friendly upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'vane#quarrelsome-pirate',
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }]
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.p1Tokens = {
                    advantage: context.player1.findCardByName('advantage'),
                };
                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player1.clickCard(context.vane);
                context.player1.clickPrompt('Deal 2 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.player1).toHavePrompt('Choose a friendly upgrade to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Tokens.advantage, context.nimbleProwess]);
                context.player1.clickCard(context.nimbleProwess);

                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to friendly base after defeating a friendly token upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'vane#quarrelsome-pirate',
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }]
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.p1Tokens = {
                    advantage: context.player1.findCardByName('advantage'),
                };
                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player1.clickCard(context.vane);
                context.player1.clickPrompt('Deal 2 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.player1).toHavePrompt('Choose a friendly upgrade to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Tokens.advantage, context.nimbleProwess]);
                context.player1.clickCard(context.p1Tokens.advantage);

                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not be able to select an upgrade that was played on a friendly unit by the enemy', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'vane#quarrelsome-pirate',
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }]
                    },
                    player2: {
                        hand: ['shadow-of-stygeon-prime'],
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.p1Tokens = {
                    advantage: context.player1.findCardByName('advantage'),
                };
                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player2.clickCard(context.shadowOfStygeonPrime);
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.clickCard(context.vane);
                context.player1.clickPrompt('Deal 2 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.player1).toHavePrompt('Choose a friendly upgrade to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Tokens.advantage, context.nimbleProwess]);
                context.player1.clickCard(context.p1Tokens.advantage);

                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to select a token upgrade on a unit that changed control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'vane#quarrelsome-pirate',
                        hand: ['change-of-heart']
                    },
                    player2: {
                        hand: ['shadow-of-stygeon-prime'],
                        groundArena: ['atst', { card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                    advantage: context.player2.findCardByName('advantage')
                };

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                context.player1.clickCard(context.vane);
                context.player1.clickPrompt('Deal 2 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.player1).toHavePrompt('Choose a friendly upgrade to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Tokens.advantage]);
                context.player1.clickCard(context.p2Tokens.advantage);

                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow the soft pass if there are no friendly upgrades', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'vane#quarrelsome-pirate',
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player1.clickCard(context.vane);
                expect(context.player1).toHaveExactPromptButtons(['Deploy Vane', 'Cancel']);
                context.player1.clickPrompt('Cancel');

                expect(context.p2Base.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);

                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Leader unit side on attack ability', function() {
            it('should deal 2 damage to enemy base if a friendly upgrade is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'vane#quarrelsome-pirate', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }]
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.p1Tokens = {
                    advantage: context.player1.findCardByName('advantage'),
                };
                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player1.clickCard(context.vane);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Defeat a friendly upgrade');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Tokens.advantage, context.nimbleProwess]);
                context.player1.clickCard(context.nimbleProwess);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(5);
                expect(context.p1Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to friendly base if a friendly upgrade is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'vane#quarrelsome-pirate', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }]
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.p1Tokens = {
                    advantage: context.player1.findCardByName('advantage'),
                };
                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player1.clickCard(context.vane);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityButton();

                expect(context.player1).toHavePrompt('Defeat a friendly upgrade');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Tokens.advantage, context.nimbleProwess]);
                context.player1.clickCard(context.nimbleProwess);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(2);
                expect(context.p2Base.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 2 damage to defender if a friendly upgrade is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'vane#quarrelsome-pirate', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }]
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.p1Tokens = {
                    advantage: context.player1.findCardByName('advantage'),
                };
                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player1.clickCard(context.vane);
                context.player1.clickCard(context.bobaFett);
                expect(context.player1).toHavePassAbilityButton();

                expect(context.player1).toHavePrompt('Defeat a friendly upgrade');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Tokens.advantage, context.nimbleProwess]);
                context.player1.clickCard(context.nimbleProwess);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.bobaFett]);
                context.player1.clickCard(context.bobaFett);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.bobaFett.damage).toBe(5);

                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'vane#quarrelsome-pirate', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['advantage', 'nimble-prowess'] }]
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'wing-leader', upgrades: ['experience'] }],
                        leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.p1Tokens = {
                    advantage: context.player1.findCardByName('advantage'),
                };
                context.p2Tokens = {
                    experience: context.player2.findCardByName('experience'),
                };

                context.player1.clickCard(context.vane);
                context.player1.clickCard(context.bobaFett);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.player1).not.toHavePrompt('Choose a friendly upgrade to defeat');

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.bobaFett.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});