describe('Unhallow', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-manipulator', 'doji-kuwanan']
                },
                player2: {
                    inPlay: ['adept-of-the-waves'],
                    hand: ['unhallow', 'unhallow', 'unhallow']
                }
            });

            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.kuwanan.honor();
            this.adept = this.player2.findCardByName('adept-of-the-waves');
            this.adept.fate = 5;
            this.unhallow = this.player2.filterCardsByName('unhallow')[0];
            this.unhallow2 = this.player2.filterCardsByName('unhallow')[1];
            this.unhallow3 = this.player2.filterCardsByName('unhallow')[2];

            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.p1SD = this.player1.findCardByName('shameful-display', 'province 1');

            this.sd3.isBroken = true;
            this.sd4.isBroken = true;
        });

        it('should be able to played on an unbroken province you control', function () {
            this.player1.pass();
            this.player2.clickCard(this.unhallow);
            expect(this.player2).toBeAbleToSelect(this.sd1);
            expect(this.player2).toBeAbleToSelect(this.sd2);
            expect(this.player2).not.toBeAbleToSelect(this.sd3);
            expect(this.player2).not.toBeAbleToSelect(this.sd4);
            expect(this.player2).toBeAbleToSelect(this.sd5);
            expect(this.player2).not.toBeAbleToSelect(this.p1SD);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');
            expect(this.unhallow.parent).toBe(this.sd1);
        });

        it('should discard if the province is broken', function () {
            this.player1.pass();
            this.player2.clickCard(this.unhallow);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [],
                type: 'military',
                province: this.sd1
            });

            this.noMoreActions();
            this.player1.clickPrompt('No');
            expect(this.unhallow.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain(
                'Unhallow is discarded from Shameful Display as it is no longer legally attached'
            );
        });

        it('should give +3 strength', function () {
            let strength = this.sd1.getStrength();
            this.player1.pass();
            this.player2.clickCard(this.unhallow);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');

            expect(this.sd1.getStrength()).toBe(strength + 3);
        });

        it('should make you lose an honor if you defend', function () {
            this.player1.pass();
            this.player2.clickCard(this.unhallow);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');

            let honor = this.player2.honor;

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: [this.adept],
                province: this.sd1
            });
            expect(this.getChatLogs(10)).toContain('player2 loses 1 honor in order to declare defending characters');

            expect(this.player2.honor).toBe(honor - 1);
        });

        it('should not make you lose an honor if you defend a different province', function () {
            this.player1.pass();
            this.player2.clickCard(this.unhallow);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');

            let honor = this.player2.honor;

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: [this.adept],
                province: this.sd2
            });
            expect(this.getChatLogs(10)).not.toContain(
                'player2 loses 1 honor in order to declare defending characters'
            );

            expect(this.player2.honor).toBe(honor);
        });

        it('should not make you lose an honor if you don\'t defend', function () {
            this.player1.pass();
            this.player2.clickCard(this.unhallow);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');

            let honor = this.player2.honor;

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: [],
                province: this.sd1
            });
            expect(this.getChatLogs(10)).not.toContain(
                'player2 loses 1 honor in order to declare defending characters'
            );

            expect(this.player2.honor).toBe(honor);
        });

        it('should stack', function () {
            this.player1.pass();
            this.player2.clickCard(this.unhallow);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');
            this.player1.pass();
            this.player2.clickCard(this.unhallow2);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');
            this.player1.pass();
            this.player2.clickCard(this.unhallow3);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');

            expect(this.sd1.attachments).toContain(this.unhallow);
            expect(this.sd1.attachments).toContain(this.unhallow2);
            expect(this.sd1.attachments).toContain(this.unhallow3);

            let honor = this.player2.honor;

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: [this.adept],
                province: this.sd1
            });
            expect(this.getChatLog(3)).toContain('player2 loses 1 honor in order to declare defending characters');
            expect(this.getChatLog(2)).toContain('player2 loses 1 honor in order to declare defending characters');
            expect(this.getChatLog(1)).toContain('player2 loses 1 honor in order to declare defending characters');

            expect(this.player2.honor).toBe(honor - 3);
        });
    });
});

describe('Unhallow with Seven Stings Keep', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-manipulator'],
                    stronghold: ['seven-stings-keep']
                },
                player2: {
                    inPlay: ['adept-of-the-waves'],
                    hand: ['unhallow']
                }
            });

            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.adept = this.player2.findCardByName('adept-of-the-waves');
            this.adept.fate = 5;
            this.unhallow = this.player2.findCardByName('unhallow');
            this.keep = this.player1.findCardByName('seven-stings-keep');

            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
        });

        it('should make you lose an honor if you defend even with SSK', function () {
            this.player1.pass();
            this.player2.clickCard(this.unhallow);
            this.player2.clickCard(this.sd1);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('1');

            let honor = this.player2.honor;

            this.noMoreActions();
            this.player1.clickCard(this.keep);
            this.player2.clickCard(this.adept);
            this.player2.clickPrompt('Done');

            this.player1.clickRing('air');
            this.player1.clickCard(this.sd1);
            this.player1.clickCard(this.manipulator);
            this.player1.clickPrompt('Initiate Conflict');

            expect(this.getChatLogs(10)).toContain('player2 loses 1 honor in order to declare defending characters');

            expect(this.player2.honor).toBe(honor - 1);
        });
    });
});
