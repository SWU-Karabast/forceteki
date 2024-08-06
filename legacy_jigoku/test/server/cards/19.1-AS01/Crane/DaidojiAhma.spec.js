describe('Daidoji Ahma', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-initiate'],
                    hand: ['i-can-swim']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'daidoji-ahma']
                }
            });
            this.togashiInitiate = this.player1.findCardByName('togashi-initiate');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.ahma = this.player2.findCardByName('daidoji-ahma');
            this.swim = this.player1.findCardByName('i-can-swim');
            this.daidojiUji.dishonor();

            this.player1.player.showBid = 5;
            this.player2.player.showBid = 1;
        });

        it('void ring', function() {
            this.daidojiUji.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'void'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Void Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.ahma);
            this.player2.clickCard(this.ahma);
            expect(this.daidojiUji.fate).toBe(1);
            expect(this.getChatLogs(5)).toContain('player2 uses Daidōji Ahma to cancel the effects of the Void Ring');
        });

        it('fire ring - honor', function() {
            this.daidojiUji.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'fire'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.daidojiUji);
            this.player1.clickPrompt('Honor Daidoji Uji');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.ahma);
            this.player2.clickCard(this.ahma);
            expect(this.daidojiUji.isHonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player2 uses Daidōji Ahma to cancel the effects of the Fire Ring');
        });

        it('fire ring - dishonor', function() {
            this.daidojiUji.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'fire'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.daidojiUji);
            this.player1.clickPrompt('Honor Daidoji Uji');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.ahma);
            this.player2.clickCard(this.ahma);
            expect(this.daidojiUji.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Daidōji Ahma to cancel the effects of the Fire Ring');
        });

        it('water ring - bow', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'water'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Water Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.ahma);
            this.player2.clickCard(this.ahma);
            expect(this.daidojiUji.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain('player2 uses Daidōji Ahma to cancel the effects of the Water Ring');
        });

        it('water ring - ready', function() {
            this.daidojiUji.bow();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'water'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Water Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.ahma);
            this.player2.clickCard(this.ahma);
            expect(this.daidojiUji.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Daidōji Ahma to cancel the effects of the Water Ring');
        });

        it('event', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [this.daidojiUji],
                ring: 'water'
            });
            this.player2.pass();
            this.player1.clickCard(this.swim);
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.ahma);
            this.player2.clickCard(this.ahma);
            expect(this.daidojiUji.location).toBe('play area');
            expect(this.getChatLogs(5)).toContain('player2 uses Daidōji Ahma to cancel the effects of I Can Swim');
        });

        it('should not interrupt on a non-dishonored character', function() {
            this.daidojiUji.fate = 1;
            this.daidojiUji.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'void'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Void Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.daidojiUji.fate).toBe(0);
        });
    });
});

describe('Daidoji Ahma - reported dynasty bug', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    inPlay: ['daidoji-ahma', 'doji-kuwanan'],
                    dynastyDiscard: ['doji-kuwanan']
                },
                player2: {
                }
            });
            this.ahma = this.player1.findCardByName('daidoji-ahma');
            this.kuwananPlay = this.player1.findCardByName('doji-kuwanan', 'play area');
            this.kuwananProvince = this.player1.findCardByName('doji-kuwanan', 'dynasty discard pile');

            this.player1.moveCard(this.kuwananProvince, 'province 1');
            this.kuwananProvince.facedown = false;
            this.kuwananPlay.dishonor();
        });

        it('should allow duplicating uniques', function() {
            this.player1.clickCard(this.kuwananProvince);
            expect(this.kuwananPlay.fate).toBe(1);
        });
    });
});
