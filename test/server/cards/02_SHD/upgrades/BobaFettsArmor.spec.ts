describe('Boba Fett\'s Armor', function () {
    integration(function (contextRef) {
        it('Boba Fett\'s Armor prevents 2 damage', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', { card: 'sabine-wren#explosives-artist', upgrades: ['boba-fetts-armor'] }],
                    leader: { card: 'boba-fett#daimyo', deployed: true },
                    hand: ['bombing-run'],
                },
                player2: {
                    groundArena: [{ card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] }]
                }
            });

            const { context } = contextRef;

            const resetBobaHealth = () => {
                context.setDamage(context.bobaFettDisintegrator, 0);
                context.setDamage(context.bobaFettDaimyo, 0);
            };

            // CASE 1: Armor prevents 2 damage when attack damage > 2
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.bobaFettDisintegrator);
            expect(context.bobaFettDisintegrator.damage).toBe(1);
            expect(context.battlefieldMarine).toBeInZone('discard');

            resetBobaHealth();

            context.player2.passAction();

            // CASE 2: Armor does not prevent damage to when not Boba Fett
            //         and damage is reduced to 0 when <= 2.
            context.player1.clickCard(context.sabineWren);
            context.player1.clickCard(context.bobaFettDisintegrator);
            context.player1.clickCard(context.bobaFettDisintegrator);
            expect(context.bobaFettDisintegrator.damage).toBe(2);
            expect(context.sabineWren).toBeInZone('discard');

            // Reset armor onto other Boba Fett for next tests
            context.player1.moveCard(context.player1.discard[1], 'hand');
            context.player2.passAction();
            context.player1.clickCard(context.player1.hand[1]);
            context.player1.clickCard(context.bobaFettDaimyo);

            resetBobaHealth();

            // CASE 3: Other Boba Fett also prevents damage
            context.player2.clickCard(context.bobaFettDisintegrator);
            context.player2.clickCard(context.bobaFettDaimyo);
            context.player2.clickPrompt('You');
            expect(context.bobaFettDisintegrator.damage).toBe(4);
            expect(context.bobaFettDaimyo.damage).toBe(3);

            resetBobaHealth();

            // CASE 4: Armor prevent 2 damage from an event
            context.player1.clickCard(context.bombingRun);
            context.player1.clickPrompt('Ground');
            context.player1.clickPrompt('Opponent');
            expect(context.bobaFettDisintegrator.damage).toBe(1);
            expect(context.bobaFettDaimyo.damage).toBe(1);
        });

        it('Boba Fett\'s Armor prevents 2 damage with shield', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine', 'sabine-wren#explosives-artist'],
                },
                player2: {
                    groundArena: [{ card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor', 'shield'] }, 'consular-security-force'],
                    hand: ['moment-of-peace']
                }
            });

            const { context } = contextRef;

            // CASE 1: Shield doesn't trigger if damage less than 2 and armor resolved first
            context.player1.clickCard(context.sabineWren);
            context.player1.clickCard(context.bobaFettDisintegrator);
            context.player1.clickCard(context.bobaFettDisintegrator);
            // Prompt from Sabine ping
            expect(context.player2).toHaveExactPromptButtons([
                'If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage',
                'Defeat shield to prevent attached unit from taking damage'
            ]);
            context.player2.clickPrompt('If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage');
            expect(context.bobaFettDisintegrator.damage).toBe(0);
            expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames(['boba-fetts-armor', 'shield']);

            // CASE 2: Shield triggers if damage less than 2 and shield resolved first
            // Prompt from Sabine combat
            expect(context.player2).toHaveExactPromptButtons([
                'If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage',
                'Defeat shield to prevent attached unit from taking damage'
            ]);
            context.player2.clickPrompt('Defeat shield to prevent attached unit from taking damage');
            expect(context.bobaFettDisintegrator.damage).toBe(0);
            expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames(['boba-fetts-armor']);

            // Reset shield onto Boba
            context.player2.clickCard(context.momentOfPeace);
            context.player2.clickCard(context.bobaFettDisintegrator);
            expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames(['boba-fetts-armor', 'shield']);

            // CASE 3: Shield triggers if damage greater than 2
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.bobaFettDisintegrator);
            expect(context.player2).toHaveExactPromptButtons([
                'If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage',
                'Defeat shield to prevent attached unit from taking damage'
            ]);
            context.player2.clickPrompt('If attached unit is Boba Fett and damage would be dealt to him, prevent 2 of that damage');
            expect(context.bobaFettDisintegrator.damage).toBe(0);
            expect(context.bobaFettDisintegrator).toHaveExactUpgradeNames(['boba-fetts-armor']);
        });
    });
});