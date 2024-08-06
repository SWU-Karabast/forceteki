describe('Shadow Step', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kudaka', 'shosuro-sadako', 'beloved-advisor', 'callow-delegate', 'khanbulak-benefactor', 'fushicho'],
                    hand: ['shadow-step', 'honored-blade']
                },
                player2: {
                    inPlay: ['togashi-yokuni', 'togashi-initiate']
                }
            });
            this.kudaka = this.player1.findCardByName('kudaka');
            this.sadako = this.player1.findCardByName('shosuro-sadako');
            this.blade = this.player1.findCardByName('honored-blade');
            this.shadowStep = this.player1.findCardByName('shadow-step');
            this.fushicho = this.player1.findCardByName('fushicho');
            this.togashiYokuni = this.player2.findCardByName('togashi-yokuni');
            this.togashiInitiate = this.player2.findCardByName('togashi-initiate');

            this.advisor = this.player1.findCardByName('beloved-advisor');
            this.delegate = this.player1.findCardByName('callow-delegate');
            this.khanbulak = this.player1.findCardByName('khanbulak-benefactor');
        });

        it('should work only on a non-mythic character you control', function() {
            this.player1.clickCard(this.shadowStep);
            expect(this.player1).not.toBeAbleToSelect(this.togashiYokuni);
            expect(this.player1).toBeAbleToSelect(this.kudaka);
            expect(this.player1).toBeAbleToSelect(this.sadako);
            expect(this.player1).not.toBeAbleToSelect(this.fushicho);
            expect(this.player1).not.toBeAbleToSelect(this.togashiInitiate);
        });

        it('should remove the character from the game and put it back into play (non-shadow, so dishonored)', function() {
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.kudaka);
            expect(this.kudaka.location).toBe('play area');
            expect(this.kudaka.isDishonored).toBe(true);
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.getChatLogs(5)).toContain('player1 plays Shadow Step to remove Kudaka from the game, then put it back into play');
        });

        it('should remove the character from the game and put it back into play (shadow, so ordinary)', function() {
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.sadako);
            expect(this.sadako.location).toBe('play area');
            expect(this.sadako.isDishonored).toBe(false);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should discard attachments', function() {
            this.player1.playAttachment(this.blade, this.kudaka);
            this.player2.pass();
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.kudaka);
            expect(this.kudaka.location).toBe('play area');
            expect(this.blade.location).toBe('conflict discard pile');
        });

        it('should discard status tokens', function() {
            let honor = this.player1.honor;
            this.kudaka.honor();
            this.game.checkGameState(true);
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.kudaka);
            expect(this.kudaka.location).toBe('play area');
            expect(this.kudaka.isDishonored).toBe(true);
            expect(this.player1.honor).toBe(honor + 1);
        });

        it('should discard fate', function() {
            this.kudaka.fate = 5;
            this.game.checkGameState(true);
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.kudaka);
            expect(this.kudaka.location).toBe('play area');
            expect(this.kudaka.fate).toBe(0);
        });

        it('should stand the character', function() {
            this.kudaka.bowed = true;
            this.game.checkGameState(true);
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.kudaka);
            expect(this.kudaka.location).toBe('play area');
            expect(this.kudaka.bowed).toBe(false);
        });

        it('should trigger leaving play triggers', function() {
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.delegate);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.delegate);
            this.player1.clickCard(this.delegate);
            this.player1.clickCard(this.kudaka);
            expect(this.delegate.location).toBe('play area');
            expect(this.delegate.isDishonored).toBe(true);
            expect(this.kudaka.isHonored).toBe(true);
        });

        it('should trigger entering play triggers', function() {
            let cards = this.player1.hand.length;
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.khanbulak);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.khanbulak.location).toBe('play area');
            expect(this.player1).toBeAbleToSelect(this.khanbulak);
            this.player1.clickCard(this.khanbulak);
            expect(this.player1.hand.length).toBe(cards + 1); //2 draw, -1 shadow step
        });

        it('should allow re-triggering actions', function() {
            let cards = this.player1.hand.length;
            let cards2 = this.player2.hand.length;
            this.player1.clickCard(this.advisor);
            this.player2.pass();
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.advisor);
            this.player2.pass();
            this.player1.clickCard(this.advisor);
            expect(this.player1.hand.length).toBe(cards + 1); //2 draw, -1 shadow step
            expect(this.player2.hand.length).toBe(cards2 + 2);
        });

        it('should put into play at home', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kudaka],
                defenders: []
            });

            expect(this.kudaka.isParticipating()).toBe(true);
            this.player2.pass();
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.kudaka);
            expect(this.kudaka.isParticipating()).toBe(false);
        });
    });
});

describe('Shadow Step - Netsu', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kudaka', 'daidoji-netsu'],
                    hand: ['shadow-step']
                },
                player2: {
                    inPlay: ['togashi-yokuni', 'togashi-initiate', 'daidoji-netsu']
                }
            });
            this.kudaka = this.player1.findCardByName('kudaka');
            this.shadowStep = this.player1.findCardByName('shadow-step');
        });

        it('should not allow playing with 2 Netsu in play', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.shadowStep);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});

describe('Expert Interpreter', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'draw',
                player1: {
                    inPlay: ['kudaka', 'expert-interpreter'],
                    hand: ['shadow-step']
                },
                player2: {
                    inPlay: ['togashi-yokuni', 'togashi-initiate']
                }
            });
            this.interpreter = this.player1.findCardByName('expert-interpreter');
            this.shadowStep = this.player1.findCardByName('shadow-step');
            this.kudaka = this.player1.findCardByName('kudaka');
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.noMoreActions();
            this.player1.clickCard(this.interpreter);
            this.player1.clickRing('air');
            this.player2.clickPrompt('No');
        });

        it('should allow playing with Interpreter active, but leave the character removed from game', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kudaka],
                defenders: [],
                ring: 'air'
            });

            expect(this.kudaka.isParticipating()).toBe(true);
            this.player2.pass();
            this.player1.clickCard(this.shadowStep);
            this.player1.clickCard(this.kudaka);
            expect(this.kudaka.location).toBe('removed from game');
        });
    });
});
