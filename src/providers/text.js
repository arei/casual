var first_letter_up = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

var provider = {
	words_list: [
		// 'alias', 'consequatur', 'aut', 'perferendis', 'sit', 'voluptatem',
		// 'accusantium', 'doloremque', 'aperiam', 'eaque','ipsa', 'quae', 'ab',
		// 'illo', 'inventore', 'veritatis', 'et', 'quasi', 'architecto',
		// 'beatae', 'vitae', 'dicta', 'sunt', 'explicabo', 'aspernatur', 'aut',
		// 'odit', 'aut', 'fugit', 'sed', 'quia', 'consequuntur', 'magni',
		// 'dolores', 'eos', 'qui', 'ratione', 'voluptatem', 'sequi', 'nesciunt',
		// 'neque', 'dolorem', 'ipsum', 'quia', 'dolor', 'sit', 'amet',
		// 'consectetur', 'adipisci', 'velit', 'sed', 'quia', 'non', 'numquam',
		// 'eius', 'modi', 'tempora', 'incidunt', 'ut', 'labore', 'et', 'dolore',
		// 'magnam', 'aliquam', 'quaerat', 'voluptatem', 'ut', 'enim', 'ad',
		// 'minima', 'veniam', 'quis', 'nostrum', 'exercitationem', 'ullam',
		// 'corporis', 'nemo', 'enim', 'ipsam', 'voluptatem', 'quia', 'voluptas',
		// 'sit', 'suscipit', 'laboriosam', 'nisi', 'ut', 'aliquid', 'ex', 'ea',
		// 'commodi', 'consequatur', 'quis', 'autem', 'vel', 'eum', 'iure',
		// 'reprehenderit', 'qui', 'in', 'ea', 'voluptate', 'velit', 'esse',
		// 'quam', 'nihil', 'molestiae', 'et', 'iusto', 'odio', 'dignissimos',
		// 'ducimus', 'qui', 'blanditiis', 'praesentium', 'laudantium', 'totam',
		// 'rem', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos',
		// 'dolores', 'et', 'quas', 'molestias', 'excepturi', 'sint',
		// 'occaecati', 'cupiditate', 'non', 'provident', 'sed', 'ut',
		// 'perspiciatis', 'unde', 'omnis', 'iste', 'natus', 'error',
		// 'similique', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt',
		// 'mollitia', 'animi', 'id', 'est', 'laborum', 'et', 'dolorum', 'fuga',
		// 'et', 'harum', 'quidem', 'rerum', 'facilis', 'est', 'et', 'expedita',
		// 'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta', 'nobis',
		// 'est', 'eligendi', 'optio', 'cumque', 'nihil', 'impedit', 'quo',
		// 'porro', 'quisquam', 'est', 'qui', 'minus', 'id', 'quod', 'maxime',
		// 'placeat', 'facere', 'possimus', 'omnis', 'voluptas', 'assumenda',
		// 'est', 'omnis', 'dolor', 'repellendus', 'temporibus', 'autem',
		// 'quibusdam', 'et', 'aut', 'consequatur', 'vel', 'illum', 'qui',
		// 'dolorem', 'eum', 'fugiat', 'quo', 'voluptas', 'nulla', 'pariatur',
		// 'at', 'vero', 'eos', 'et', 'accusamus', 'officiis', 'debitis', 'aut',
		// 'rerum', 'necessitatibus', 'saepe', 'eveniet', 'ut', 'et',
		// 'voluptates', 'repudiandae', 'sint', 'et', 'molestiae', 'non',
		// 'recusandae', 'itaque', 'earum', 'rerum', 'hic', 'tenetur', 'a',
		// 'sapiente', 'delectus', 'ut', 'aut', 'reiciendis', 'voluptatibus',
		// 'maiores', 'doloribus', 'asperiores', 'repellat'
		'able','about','accountable','action','adoption','advise','aid','alarming','all','an','and','any','around',
		'as','ask','asserts','attire','attitude','audience','awareness','back','back-end','bandwidth','banner','barn',
		'base','based','baseline','be','bed','beef','been','before','bells','better','big','bleeding','blue','boil',
		'book','bootstrapped','bottleneck','bounce','box','boys','brand','build','but','calendar','can','antics',
		'candor','cannibalize','capacity','carrot','catching','cats','cause','certitudes','champion','change','choice',
		'clean','clear','client','close','closing','cloud','cloudy','clowns','club','come','commitment','comms',
		'community','competencies','components','consent','contribution','core','corporate','could','cowbell','crack',
		'crank','creep','culture','customer','dances','data','day','dead','deck','deductions','deliverables','deploy',
		'design','dialog','digital','digitalize','diligence','discussion','distributors','diversify','do','does',
		'dog','dogging','done','door','drawing-board','drink','drive','driving','due','during','eat','economy','edge',
		'effects','efforts','email','engagement','enough','environment','evangelize','even','evolve','execute',
		'existing','experience','exploratory','exposing','eye','face','false','feelers','field','fire','fireball',
		'firehose','flows','focus','food','for','forcing','forward','founded','from','fruit','full','function',
		'future','future-proof','game-plan','get','giant','global','go','going','great','ground','growth',
		'hands','hard','harvest','has','have','here','high','highlights','his','hit','hits','horse','horsehead',
		'hothouse','how','ideal','ideas','if','imagineer','impactful','in','inclusion','incompetent','initiative',
		'instead','integration','into','investigation','is','issues','it','item','jelly','job','journey','just',
		'keep','key','killing','kimono','know','knowledge','ladder','land','language','last','latest','launch',
		'less','let','level','leverage','lift','like','line','literacy','local','loop','loss','lot','low',
		'low-hanging','lunch','make','makes','market','market-facing','markets','masking','me','measure','meat',
		'meet','meeting','message','metal','mice','milestones','mindfulness','mint','model','more','motivate',
		'move','much','my','nail','neck','need','needle','needs','net','new','no-brainer','nor','not','now',
		'obviously','ocean','octopus','of','offer','offline','old','on','one-sheet','onion','open','opportunity',
		'optimize',	'or','organic','our','out','outside','over','overcome','own','paper','parallel','parking','path',
		'peel','per','pig','pivot','pixel','place','plane','player','playing','please','point','policy','polishing',
		'post','power','prairie','premise','prethink','previous','price','prioritizing','priority','proceduralize',
		'productive','project','prospects','pushback','pushing','put','putting','python','quarter','quick-win',
		'radical','really','record','regroup','rehydrate','request','responsible','review','rich','right','roll',
		'room','running','savvy','scales','scaling','schedule','scope','sea','search','see','service','set','shall',
		'shift','should','simple','single','skulls','sky','so','socialize','socks','solution','solutionize',
		'soonest','speed','sprint','staircase','stakeholder','stakeholders','standup','status','stick','stop',
		'strategic','strategy','success','sunset','synergize','synergy','talk','target','team','teams',
		'technologically','terrorists','thanks','that','the','these','thinking','third','this','three-martini',
		'throughput','time','to','today','too','touch','tribal','try','ultimate','understanding','up','usage','use',
		'vampire','vendor','version','vertical','wall','want','wash','water','ways','we','weeds','well','were',
		'what','when','where','whistles','who','wider','wiggle','will','window','with','work','world','would',
		'wringable','yet','you','your'
	],

	letters: 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',

	phonetics: [
		'Alfa', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel',
		'India', 'Juliett', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa',
		'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey',
		'X-ray', 'Yankee', 'Zulu'
	],

	title: function() {
		return first_letter_up(this.words(this.integer(2, 3)));
	},

	sentence: function() {
		return first_letter_up(this.words(this.integer(3, 10))) + '.';
	},

	text: function() {
		return this.sentences(this.integer(3, 6));
	},

	description: function() {
		return this.sentences(this.integer(2, 5));
	},

	short_description: function() {
		return this.sentence;
	},

	string: function() {
		return this.words();
	},

	sentences: function(n) {
		n = n || 3;

		var result = [];
		for (var i = 0; i < n; ++i) {
			result.push(this.sentence);
		}

		return result.join(' ');
	},

	word: function() {
		return this.random_element(this.words_list);
	},

	words: function(n) {
		return this.array_of_words(n).join(' ');
	},

	array_of_words: function(n) {
		n = n || 7;
		var result = [];

		for (var i = 0; i < n; ++i) {
			result.push(this.word);
		}

		return result;
	},

	letter: function() {
		return this.random_element(this.letters);
	},

	letter_phonetic: function() {
		return this.random_element(this.phonetics);
	}
};

module.exports = provider;
