describe('Wait Until It Sings', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['daidoji-ambusher', 'kakita-yoshi'],
                    hand: ['wait-until-it-sings', 'dutiful-assistant', 'kakita-technique']
                },
                player2: {
                    inPlay: ['master-tactician'],
                    hand: ['wait-until-it-sings', 'a-perfect-cut', 'kakita-technique']
                },
                gameMode: 'emerald'
            });

            this.ambusher = this.player1.findCardByName('daidoji-ambusher');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.assistant = this.player1.findCardByName('dutiful-assistant');
            this.sings = this.player1.findCardByName('wait-until-it-sings');
            this.technique = this.player1.findCardByName('kakita-technique')

            this.tactician = this.player2.findCardByName('master-tactician');
            this.sings2 = this.player2.findCardByName('wait-until-it-sings');
            this.cut = this.player2.findCardByName('a-perfect-cut');
            this.technique2 = this.player2.findCardByName('kakita-technique')
        });

        it('should give you an action during resolution - p1', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ambusher, this.yoshi],
                defenders: [this.tactician]
            });

            this.player2.pass();
            this.player1.clickCard(this.sings);

            this.ambusher.bow();
            this.yoshi.bow();

            expect(this.getChatLogs(10)).toContain('player1 plays Wait Until It Sings to take an action before conflict resolution');

            this.noMoreActions();

            expect(this.getChatLogs(10)).toContain('player1 has a bonus action during resolution!');
            expect(this.getChatLogs(10)).not.toContain('player2 won a military conflict 5 vs 0');
            expect(this.player1).toHavePrompt('Conflict Action Window');

            this.player1.clickCard(this.ambusher);
            this.player1.clickCard(this.tactician);

            expect(this.getChatLogs(10)).toContain('player2 won a military conflict 3 vs 0');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should give you an action during resolution - p2', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ambusher, this.yoshi],
                defenders: [this.tactician]
            });

            this.ambusher.bow();
            this.yoshi.bow();

            this.player2.clickCard(this.sings2);
            expect(this.getChatLogs(10)).toContain('player2 plays Wait Until It Sings to take an action before conflict resolution');

            this.player1.playAttachment(this.assistant, this.ambusher);
 
            this.noMoreActions();

            expect(this.getChatLogs(10)).toContain('player2 has a bonus action during resolution!');
            expect(this.player2).toHavePrompt('Conflict Action Window');

            this.player2.clickCard(this.cut);
            this.player2.clickCard(this.tactician);

            expect(this.getChatLogs(10)).toContain('player2 won a military conflict 7 vs 0');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('checking different action ordering', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ambusher, this.yoshi],
                defenders: [this.tactician]
            });

            this.ambusher.bow();
            this.yoshi.bow();

            this.player2.clickCard(this.sings2);
            expect(this.getChatLogs(10)).toContain('player2 plays Wait Until It Sings to take an action before conflict resolution');
 
            this.noMoreActions();

            expect(this.getChatLogs(10)).toContain('player2 has a bonus action during resolution!');
            expect(this.player2).toHavePrompt('Conflict Action Window');

            this.player2.clickCard(this.cut);
            this.player2.clickCard(this.tactician);

            expect(this.getChatLogs(10)).toContain('player2 won a military conflict 7 vs 0');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('both players play - p1 action followed by p2 action', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ambusher, this.yoshi],
                defenders: [this.tactician]
            });

            this.ambusher.bow();
            this.yoshi.bow();

            this.player2.clickCard(this.sings2);
            this.player1.clickCard(this.sings);
 
            this.noMoreActions();

            expect(this.getChatLogs(10)).toContain('player1 has a bonus action during resolution!');
            expect(this.getChatLogs(10)).not.toContain('player2 has a bonus action during resolution!');
            expect(this.player1).toHavePrompt('Conflict Action Window');

            this.player1.clickCard(this.ambusher);
            this.player1.clickCard(this.tactician);

            expect(this.getChatLogs(10)).toContain('player2 has a bonus action during resolution!');
            expect(this.player2).toHavePrompt('Conflict Action Window');

            this.player2.clickCard(this.cut);
            this.player2.clickCard(this.tactician);

            expect(this.getChatLogs(10)).toContain('player2 won a military conflict 5 vs 0');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('combining with aditional actions', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ambusher, this.yoshi],
                defenders: [this.tactician]
            });

            this.ambusher.bow();
            this.yoshi.bow();

            this.player2.clickCard(this.sings2);
            this.noMoreActions();

            expect(this.getChatLogs(10)).toContain('player2 has a bonus action during resolution!');
            expect(this.player2).toHavePrompt('Conflict Action Window');

            this.player2.clickCard(this.technique2);
            this.player2.clickCard(this.tactician);

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.cut);
            this.player2.clickCard(this.tactician);

            expect(this.getChatLogs(10)).toContain('player2 won a military conflict 11 vs 0');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not carry over to the next conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.ambusher, this.yoshi],
                defenders: [this.tactician]
            });

            this.ambusher.bow();
            this.yoshi.bow();

            this.player2.clickCard(this.sings2);
            this.noMoreActions();

            expect(this.getChatLogs(10)).toContain('player2 has a bonus action during resolution!');
            expect(this.player2).toHavePrompt('Conflict Action Window');

            this.player2.clickCard(this.cut);
            this.player2.clickCard(this.tactician);

            expect(this.getChatLogs(10)).toContain('player2 won a military conflict 7 vs 0');
            expect(this.player1).toHavePrompt('Action Window');

            this.ambusher.ready();
            this.yoshi.ready();
            this.tactician.ready();

            this.noMoreActions();
            this.initiateConflict({
                defenders: [this.ambusher, this.yoshi],
                attackers: [this.tactician],
                ring: 'earth'
            });

            this.tactician.bow();
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
