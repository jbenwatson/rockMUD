window.onload = function() {
	'use strict';
	var ws = io.connect('', {transports: ['websocket']}),
	terminal = document.getElementById('terminal'),
	node = document.getElementById('cmd'),
	rowCnt = 0,
	canSend = true,
	aliases = {
		n: 'move north',
		e: 'move east',
		w: 'move west',
		s: 'move south',
		u: 'move up',
		d: 'move down',
		north: 'move north',
		east: 'move east',
		west: 'move west',
		south: 'move south',
		up: 'move up',
		down: 'move down',
		fl: 'flee',
		fol: 'follow',
		uf: 'unfollow',
		gr: 'group',
		l: 'look',
		sca: 'scan',
		i: 'inventory',
		sc: 'score',
		o: 'open',
		op: 'open',
		stats: 'score',
		eq: 'equipment',
		equip: 'wear',
		we: 'wear',
		re: 'remove',
		q: 'quaff',
		c: 'cast',
		k: 'kill',
		adv: 'kill',
		attack: 'kill',
		murder: 'kill',
		res: 'rest',
		sl: 'sleep',
		h: 'help',
		wh: 'who',
		whe: 'where',
		af: 'affects',
		aff: 'affects',
		ooc: 'chat',
		shout: 'chat',
		sh: 'chat',
		slist: 'skills',
		skill: 'skills',
		desc: 'description',
		r: 'recall',
		wake: 'stand',
		g: 'get',
		tr: 'train',
		prac: 'practice',
		nod: 'emote nods solemly.',
		laugh: 'emote laughs heartily.',
		wo: 'worth',
		rec: 'recall',
		gi: 'give',
		wield: 'wear',
		dr: 'drop',
		j: 'quests',
		ql: 'quests',
		quest: 'quests'
	},
	isScrolledToBottom = false,
	playerIsLogged = null,
	display = function(r, addToDom) {
		var i = 0;

		if (addToDom) {
			rowCnt += 1;

			terminal.innerHTML += '<div class="row">' + r.msg + '</div>';

			checkCmdEvents(rowCnt);

			if (rowCnt >= 160) {
				for (i; i < terminal.childNodes.length; i += 1) {
					terminal.removeChild(terminal.childNodes[i]);
				}

				rowCnt = 0;
			}

			isScrolledToBottom = terminal.scrollHeight - terminal.clientHeight <= terminal.scrollTop + 1;

			if (!isScrolledToBottom) {
				terminal.scrollTop = terminal.scrollHeight - terminal.clientHeight;
			}
		}

		return parseCmd(r);
	},
	checkCmdEvents = function(rowCnt) {
		var i = 0,
		processCmdClick = function(evt, nodeRef) {
			evt.preventDefault();

			node.value = this.getAttribute('data-cmd-value');


			send(evt);
		},
		nodes = document.querySelectorAll('[data-cmd="true"]');

		for (i; i < nodes.length; i += 1) {
			(function(nodeRef, index) {
				if (nodeRef.getAttribute('data-cmd')) {
					nodeRef.setAttribute('data-cmd', false);
					nodeRef.addEventListener('click', processCmdClick, false);
				} else {
					nodeRef.removeEventListener('click', processCmdClick, true);
				}
			}(nodes[i], i));
		}
	},
	parseCmd = function(r) {
		if (r.msg !== undefined) {
			r.msg = r.msg.replace(/ /g, ' ').trim();

			ws.emit(r.emit, r);
		}
	},
	checkAlias = function(cmdStr, fn) { 
		var keys = Object.keys(aliases),
		i = 0,
		cmd,
		msg,
		keyLength = keys.length,
		cmdArr = cmdStr.split(' ');

		cmd = cmdArr[0].toLowerCase();

		msg = cmdArr.slice(1).join(' ');

		for (i; i < keyLength; i += 1) {
			if (keys[i] === cmd) {
				if (msg === '') {
					return fn(aliases[keys[i]]);
				} else {
					return fn(aliases[keys[i]] + ' ' + msg);
				}
			}
		}

		return fn(cmd + ' ' + msg);
	},
	send = function(e) {
		var messageNodes = [],
		msg = node.value.trim(),
		msgObj = {
			msg: checkAlias(msg, function(cmd) {
				return cmd;
			}),
			emit: 'cmd'
		};

		e.preventDefault();

		if (canSend) {
			display(msgObj);
			
			node.value = '';
			node.focus();

			canSend = false;
			
			return false;
		} else {
			return false;
		}
	};

	document.onclick = function() {
		node.focus();
	};

	document.addEventListener('reqPassword', function(e) {
		e.preventDefault();
		
		node.type = 'password';
		node.placeholder = 'Login password';
	}, false);

	document.addEventListener('onLogged', function(e) {
		e.preventDefault();

		node.type = 'text';
		node.placeholder = 'Enter a Command -- type \'help commands\' for a list of basic commands';
	}, false);

	document.getElementById('console').onsubmit = function (e) {
		send(e);
	};

	node.focus();

	ws.on('msg', function(r) {
		display(r, true);

		if (r.evt && !r.evt.data) {
			r.evt = new CustomEvent(r.evt);
			
			if (r.data) {
				r.evt.data = r.data;
			}

			document.dispatchEvent(r.evt);
		}
	});

	setInterval(function() {
		canSend = true;
	}, 175);
};
