const encoder = new TextEncoder();

class HuffNode {
	constructor({weight, value=null, left=null, right=null}) {
		this.weight = weight;
		this.value = value;
		this.left = left;
		this.right = right;
	}

	compare(other) {
		return this.weight - other.weight;
	}
}

//maps byte to its bit representation
//node	the root node of (sub)tree
//table	the mapping from byte to bit length
//cur	bit string representing the location in tree (prefix of node's bit string)
function mapByteToBits(node, table, cur='') {
	if(!node) {
		console.log('BLOODY MURDER');
	}
	if(node.value !== null) {
		//leaf node, record in table
		//if cur is '', then someone made a huffman table of data
		//with one unique byte
		//just return 0 to that dummy
		if(cur !== '') {
			table[node.value] = cur;
		} else {
			table[node.value] = '0';
		}
	} else {
		//not a leaf, recurse on children
		mapByteToBits(node.left, table, cur + '0');
		mapByteToBits(node.right, table, cur + '1');
	}
}

//returns bit-length of huffman-encoded representation of text
export function getEntropyBits(text) {
	if(text.length === 0) {
		return 0;
	}
	const bytes = encoder.encode(text);

	//find frequency of each byte
	const freq = {};
	bytes.forEach(byte => {
		if(freq[byte]) {
			freq[byte]++;
		} else {
			freq[byte] = 1;
		}
	});

	//initialize set of nodes
	let nodes = []
	Object.keys(freq).forEach(byte => {
		nodes.push(new HuffNode({weight: freq[byte], value: byte}));
	});

	//do the huffman encoding process
	while(nodes.length > 1) {
		//pick two lowest-weighted nodes (the lazy way)
		nodes.sort((a,b) => a.compare(b));
		const least = nodes.splice(0, 2);
		
		//combine the two by making them children of a new node
		const combined = new HuffNode({
			weight: least[0].weight + least[1].weight,
			left: least[0],
			right: least[1],
		});
		
		//put the new node back in the set
		nodes.push(combined);
	}

	//build byte to bit string table
	const table = {}
	mapByteToBits(nodes[0], table);

	//get total length of bytes's compressed bitstring
	return bytes.map(b => table[b].length).reduce((acc, x) => acc + x);
}
