describe('Spectral Visitation', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker'],
                    dynastyDiscard: ['bayushi-shoju']
                },
                player2: {
                    dynastyDiscard: ['kakita-yoshi', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai'],
                    provinces: ['spectral-visitation', 'manicured-garden']
                }
            });

            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.shoju = this.player1.findCardByName('bayushi-shoju');

            this.spectralVisitation = this.player2.findCardByName('spectral-visitation');
            this.manicured = this.player2.findCardByName('manicured-garden');
            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.kageyu = this.player2.findCardByName('daidoji-kageyu');
            this.chagatai = this.player2.findCardByName('moto-chagatai');
        });

        it('should trigger when it is revealed', function() {
            this.noMoreActions();
            expect(this.spectralVisitation.facedown).toBe(true);

            this.initiateConflict({
                attackers: [this.berserker],
                province: this.spectralVisitation,
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.spectralVisitation);
        });

        it('should not trigger if your deck doesn\'t have enough cards', function() {
            this.noMoreActions();
            expect(this.spectralVisitation.facedown).toBe(true);

            this.player2.reduceDeckToNumber('dynasty deck', 3);

            this.initiateConflict({
                attackers: [this.berserker],
                province: this.spectralVisitation,
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Choose defenders');
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).not.toBeAbleToSelect(this.spectralVisitation);
        });

        it('should not allow you to target enemy dynasty discard pile', function() {
            this.noMoreActions();
            expect(this.spectralVisitation.facedown).toBe(true);

            this.initiateConflict({
                attackers: [this.berserker],
                province: this.spectralVisitation,
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.spectralVisitation);
            this.player2.clickCard(this.spectralVisitation);

            expect(this.player2).not.toBeAbleToSelect(this.shoju);
        });

        it('should discard the top 4 cards of your dynasty deck to activate', function() {
            this.noMoreActions();
            expect(this.spectralVisitation.facedown).toBe(true);

            this.player2.player.moveCard(this.toshimoko, 'dynasty deck');
            expect(this.toshimoko.location).toBe('dynasty deck');

            this.initiateConflict({
                attackers: [this.berserker],
                province: this.spectralVisitation,
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.spectralVisitation);
            this.player2.clickCard(this.spectralVisitation);
            this.player2.clickCard(this.yoshi);

            expect(this.toshimoko.location).toBe('dynasty discard pile');
            expect(this.yoshi.location).toBe('play area');
            expect(this.getChatLogs(10)).toContain('player2 uses Spectral Visitation, discarding Kakita Toshimoko, Adept of the Waves, Adept of the Waves and Adept of the Waves to put a dynasty character into play');
            expect(this.getChatLogs(10)).toContain('player2 puts Kakita Yoshi into play. Kakita Yoshi will be put on the bottom of the deck if it\'s still in play by the end of the phase');
        });

        it('the cards discarded should be viable as targets for the ability', function() {
            this.noMoreActions();
            expect(this.spectralVisitation.facedown).toBe(true);

            this.player2.reduceDeckToNumber('dynasty deck', 3);
            this.player2.player.moveCard(this.toshimoko, 'dynasty deck');
            expect(this.toshimoko.location).toBe('dynasty deck');

            this.initiateConflict({
                attackers: [this.berserker],
                province: this.spectralVisitation,
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.spectralVisitation);
            this.player2.clickCard(this.spectralVisitation);
            this.player2.clickCard(this.toshimoko);

            expect(this.toshimoko.location).toBe('play area');
        });

        it('should place on the bottom of the deck at the end of the phase', function() {
            this.noMoreActions();
            expect(this.spectralVisitation.facedown).toBe(true);

            this.player2.player.moveCard(this.toshimoko, 'dynasty deck');
            expect(this.toshimoko.location).toBe('dynasty deck');

            this.initiateConflict({
                attackers: [this.berserker],
                province: this.spectralVisitation,
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.spectralVisitation);
            this.player2.clickCard(this.spectralVisitation);
            this.player2.clickCard(this.yoshi);
            expect(this.yoshi.location).toBe('play area');
            this.berserker.bowed = true;
            this.player2.clickPrompt('Done');
            this.noMoreActions();
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.noMoreActions();
            this.player2.passConflict();
            this.noMoreActions();
            this.player2.clickPrompt('Military');
            expect(this.game.currentPhase).toBe('fate');
            expect(this.yoshi.location).toBe('dynasty deck');

            expect(this.getChatLogs(5)).toContain('Kakita Yoshi returns to the bottom of the deck due to Spectral Visitation\'s effect');
        });
    });
});

describe('Spectral Visitation with no character in the discard pile', function () {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-berserker'],
                    dynastyDiscard: ['bayushi-shoju']
                },
                player2: {
                    provinces: ['spectral-visitation', 'manicured-garden']
                }
            });

            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.shoju = this.player1.findCardByName('bayushi-shoju');

            this.spectralVisitation = this.player2.findCardByName('spectral-visitation');
            this.manicured = this.player2.findCardByName('manicured-garden');
        });

        it('should trigger when it is revealed, even without any characters in discard - functional errata', function() {
            this.noMoreActions();
            expect(this.spectralVisitation.facedown).toBe(true);

            this.initiateConflict({
                attackers: [this.berserker],
                province: this.spectralVisitation,
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.spectralVisitation);
        });
    });
});

describe('Spectral Visitation in the Dynasty Phase', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['matsu-berserker'],
                    dynastyDiscard: ['bayushi-shoju', 'iuchi-farseer']
                },
                player2: {
                    dynastyDiscard: ['kakita-yoshi', 'kakita-toshimoko', 'daidoji-kageyu', 'moto-chagatai'],
                    provinces: ['spectral-visitation', 'manicured-garden']
                }
            });

            this.farseer = this.player1.moveCard('iuchi-farseer', 'province 1');
            this.farseer.facedown = false;

            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.shoju = this.player1.findCardByName('bayushi-shoju');

            this.spectralVisitation = this.player2.findCardByName('spectral-visitation');
            this.manicured = this.player2.findCardByName('manicured-garden');
            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.kageyu = this.player2.findCardByName('daidoji-kageyu');
            this.chagatai = this.player2.findCardByName('moto-chagatai');
        });

        it('should trigger when it is revealed', function() {
            this.player1.clickCard(this.farseer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.farseer);
            this.player1.clickCard(this.spectralVisitation);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.spectralVisitation);
        });

        it('should place on the bottom of the deck at the end of the phase', function() {
            this.player1.clickCard(this.farseer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.farseer);
            this.player1.clickCard(this.spectralVisitation);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.spectralVisitation);
            this.player2.clickCard(this.spectralVisitation);
            this.player2.clickCard(this.yoshi);
            expect(this.yoshi.location).toBe('play area');

            this.noMoreActions();
            expect(this.game.currentPhase).toBe('draw');
            expect(this.yoshi.location).toBe('dynasty deck');
        });

        it('due to some wacky shenanigans it could end up back in a province/in play, make sure it doesn\'t get put on the bottom of the deck again', function() {
            this.player1.player.promptedActionWindows.draw = true;
            this.player2.player.promptedActionWindows.draw = true;
            this.player1.clickCard(this.farseer);
            this.player1.clickPrompt('0');
            this.player1.clickCard(this.farseer);
            this.player1.clickCard(this.spectralVisitation);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.spectralVisitation);
            this.player2.clickCard(this.spectralVisitation);
            this.player2.clickCard(this.yoshi);
            expect(this.yoshi.location).toBe('play area');

            this.player2.moveCard(this.yoshi, 'dynasty discard pile'); //could be via something like Noble Sacrifice

            this.noMoreActions();
            expect(this.game.currentPhase).toBe('draw');
            expect(this.yoshi.location).toBe('dynasty discard pile');

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            expect(this.game.currentPhase).toBe('draw');
            this.player2.moveCard(this.yoshi, 'play area');
            this.noMoreActions();
            expect(this.game.currentPhase).toBe('conflict');
            expect(this.yoshi.location).toBe('play area');
        });
    });
});
