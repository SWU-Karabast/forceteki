describe('Darth Sidious, Under a Cloak of Darkness', function() {
    integration(function(contextRef) {
        describe('Darth Sidious\' constant and triggered abilities', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-sidious#under-a-cloak-of-darkness', 'clone-trooper', 'super-battle-droid'],
                        spaceArena: ['awing'],
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper', 'warrior-drone', 'atst'],
                    }
                });
            });

            it('should not create a Battle Droid token when a token is defeated', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.cloneTrooper);
                context.player1.clickCard(context.atst);

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(0);
                expect(context.getChatLogs(1)).not.toContain('player1 uses Darth Sidious to create a Battle Droid token');
            });

            it('should create a Battle Droid token when a non-token is defeated', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.superBattleDroid);
                context.player1.clickCard(context.warriorDrone);

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
                expect(context.getChatLogs(1)).toContain('player1 uses Darth Sidious to create a Battle Droid token');
            });

            it('should work off of Sidious dying', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.darthSidious);
                context.player1.clickCard(context.atst);

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
            });

            it('should be giving other friendly Separatists +1/+0', function() {
                const { context } = contextRef;

                // not buffed from own ability
                expect(context.darthSidious.getPower()).toBe(4);
                // buffed
                expect(context.superBattleDroid.getPower()).toBe(5);
                // not buffed
                expect(context.awing.getPower()).toBe(1);
                expect(context.cloneTrooper.getPower()).toBe(2);
                expect(context.warriorDrone.getPower()).toBe(1);
                expect(context.atst.getPower()).toBe(6);
                expect(context.deathStarStormtrooper.getPower()).toBe(3);
            });
        });

        it('should handle superlaser blast', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['superlaser-blast'],
                    groundArena: [
                        'darth-sidious#under-a-cloak-of-darkness',
                        'sebulbas-podracer#taking-the-lead',
                        'clone-trooper'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true },
                    deck: ['surprise-strike', 'echo#restored', 'green-squadron-awing', 'daring-raid', 'sudden-ferocity']
                },
                player2: {
                    discard: ['wolffe#suspicious-veteran'],
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.superlaserBlast);
            context.player1.clickPrompt('Create a Battle Droid token: Darth Sidious');
            context.player1.clickPrompt('Create a Battle Droid token: Sebulba\'s Podracer');
            context.player1.clickPrompt('Create a Battle Droid token: Battlefield Marine');
            expect(context.player2).toBeActivePlayer();

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids).toAllBeInZone('groundArena');
            expect(battleDroids.length).toBe(4);
        });

        it('should not make a droid if a piloted token is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall', 'confiscate'],
                    groundArena: ['darth-sidious#under-a-cloak-of-darkness'],
                    deck: ['surprise-strike', 'echo#restored', 'green-squadron-awing', 'daring-raid', 'sudden-ferocity']
                },
                player2: {
                    discard: ['wolffe#suspicious-veteran'],
                    spaceArena: [{ card: 'tie-fighter', upgrades: ['clone-pilot'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.tieFighter);

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(0);
        });

        it('should not make a droid if a pilot upgrade is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall', 'confiscate'],
                    groundArena: ['darth-sidious#under-a-cloak-of-darkness'],
                    deck: ['surprise-strike', 'echo#restored', 'green-squadron-awing', 'daring-raid', 'sudden-ferocity']
                },
                player2: {
                    discard: ['wolffe#suspicious-veteran'],
                    spaceArena: [{ card: 'tie-fighter', upgrades: ['clone-pilot'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.confiscate);
            context.player1.clickCard(context.clonePilot);

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(0);
        });

        it('should not make a droid if a token unit piloted by a leader is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall', 'confiscate'],
                    groundArena: ['darth-sidious#under-a-cloak-of-darkness'],
                    deck: ['surprise-strike', 'echo#restored', 'green-squadron-awing', 'daring-raid', 'sudden-ferocity']
                },
                player2: {
                    discard: ['wolffe#suspicious-veteran'],
                    spaceArena: ['tie-fighter'],
                    leader: 'darth-vader#victor-squadron-leader',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.darthVader);
            context.player2.clickPrompt('Deploy Darth Vader as a pilot');
            context.player2.clickCard(context.tieFighter);

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.tieFighter);

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(0);
        });

        it('should not make a droid if a pilot leader is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall', 'confiscate'],
                    groundArena: ['darth-sidious#under-a-cloak-of-darkness'],
                    deck: ['surprise-strike', 'echo#restored', 'green-squadron-awing', 'daring-raid', 'sudden-ferocity']
                },
                player2: {
                    discard: ['wolffe#suspicious-veteran'],
                    spaceArena: ['tie-fighter'],
                    leader: 'darth-vader#victor-squadron-leader',
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.darthVader);
            context.player2.clickPrompt('Deploy Darth Vader as a pilot');
            context.player2.clickCard(context.tieFighter);

            context.player1.clickCard(context.confiscate);
            context.player1.clickCard(context.darthVader);

            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(0);
        });
    });
});